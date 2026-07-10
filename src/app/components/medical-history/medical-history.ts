import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type FileCategory = 'report' | 'prescription' | 'radiology' | 'lab';

interface MedicalFileItem {
  name: string;
  date: string;
  type: 'PDF' | 'JPEG' | 'PNG';
  size: string;
  category: FileCategory;
}

interface CategoryInfo {
  key: FileCategory;
  label: string;
  count: number;
}

// ===== عنصر جديد: بيمثل ملف في شاشة الرفع قبل ما يتبعت =====
interface UploadItem {
  id: string;
  file: File;
  category: FileCategory | '';
  error: string | null;
  status: 'uploading' | 'done' | 'error';
  progress: number; // 0 - 100
}

interface CategorySelectOption {
  key: FileCategory | '';
  label: string;
}

@Component({
  selector: 'app-medical-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medical-history.html',
  styleUrl: './medical-history.css'
})
export class MedicalHistory {
  constructor(private cdr: ChangeDetectorRef) {}

  view: 'list' | 'upload' = 'list';

  // ===== إعدادات شاشة الرفع =====
  readonly maxFiles = 5;
  readonly maxSizeMB = 5;
  readonly allowedExt = ['pdf', 'png', 'jpg', 'jpeg'];

  categorySelectOptions: CategorySelectOption[] = [
    { key: '', label: 'اختر التصنيف' },
    { key: 'report', label: 'تقرير طبي' },
    { key: 'prescription', label: 'وصفة طبية' },
    { key: 'radiology', label: 'أشعة' },
    { key: 'lab', label: 'تحليل طبي' }
  ];

  // ===== الملفات المختارة في شاشة الرفع (قبل التأكيد) =====
  uploadItems: UploadItem[] = [];
  isDragging = false;

  files: MedicalFileItem[] = [
    { name: 'تحليل الدم الشامل - يونيو 2025', date: '2025-06-01', type: 'PDF', size: '1.2 MB', category: 'lab' },
    { name: 'أشعة صدر - مايو 2025', date: '2025-05-14', type: 'JPEG', size: '3.8 MB', category: 'radiology' },
    { name: 'وصفة د. أحمد السعيد', date: '2025-04-20', type: 'PDF', size: '0.4 MB', category: 'prescription' },
    { name: 'تقرير طبي شامل', date: '2025-03-10', type: 'PDF', size: '2.1 MB', category: 'report' }
  ];

  // عدد الملفات لكل تصنيف بيتحسب أوتوماتيك من طول القائمة أعلاه
  get categories(): CategoryInfo[] {
    const countOf = (key: FileCategory) => this.files.filter(f => f.category === key).length;
    return [
      { key: 'lab', label: 'التحاليل الطبية', count: countOf('lab') },
      { key: 'radiology', label: 'الأشعة', count: countOf('radiology') },
      { key: 'prescription', label: 'الوصفات الطبية', count: countOf('prescription') },
      { key: 'report', label: 'التقارير الطبية', count: countOf('report') }
    ];
  }

  goToUpload() {
    this.view = 'upload';
    this.uploadItems = [];
  }

  goBack() {
    this.view = 'list';
    this.uploadItems = [];
  }

  // ===== اختيار الملفات (بقت بتقبل أكتر من ملف مرة واحدة) =====
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
    }
    input.value = ''; // يسمح باختيار نفس الملف تاني لو اتشال من القائمة
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  private addFiles(fileList: FileList) {
    const remainingSlots = this.maxFiles - this.uploadItems.length;
    if (remainingSlots <= 0) return;

    const incoming = Array.from(fileList).slice(0, remainingSlots);

    incoming.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const sizeMB = file.size / (1024 * 1024);

      let error: string | null = null;
      if (!this.allowedExt.includes(ext)) {
        error = 'هذا الامتداد غير مدعوم، أعد تحميل الملف مرة أخرى';
      } else if (sizeMB > this.maxSizeMB) {
        error = 'حجم الملف أكبر من الحجم المسموح، يرجى رفع ملف أصغر';
      }

      const item: UploadItem = {
        id: crypto.randomUUID(),
        file,
        category: '',
        error,
        status: error ? 'error' : 'uploading',
        progress: error ? 0 : 0
      };

      this.uploadItems.push(item);

      // ===== محاكاة رفع الملف (لحد ما نربط الـ API الحقيقي) =====
      // TODO: لما نربط الباك اند، هنستبدل الـ setInterval ده بمتابعة
      // upload progress حقيقي من الـ HttpClient (reportProgress: true)
      if (!error) {
        this.simulateUploadProgress(item);
      }
    });
  }

  private simulateUploadProgress(item: UploadItem) {
    const stepMs = 90;
    const increment = 8 + Math.random() * 10; // سرعة عشوائية بسيطة لكل ملف

    const interval = setInterval(() => {
      const stillExists = this.uploadItems.some(i => i.id === item.id);
      if (!stillExists) {
        clearInterval(interval);
        return;
      }

      item.progress = Math.min(100, item.progress + increment);

      if (item.progress >= 100) {
        item.progress = 100;
        item.status = 'done';
        clearInterval(interval);
      }

      // ===== مهم: بنجبر الشاشة تعمل render تاني يدويًا =====
      // في المشاريع اللي شغالة Zoneless، تعديل item.progress جوه
      // setInterval لوحده مش كافي إن Angular يحدّث الشاشة تلقائي
      this.cdr.detectChanges();
    }, stepMs);
  }

  removeUploadItem(id: string) {
    this.uploadItems = this.uploadItems.filter(i => i.id !== id);
  }

  onCategoryChange(id: string, category: FileCategory | '') {
    const item = this.uploadItems.find(i => i.id === id);
    if (item) item.category = category;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(0) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ===== تجميع الملفات لعرضها في قسمين: "تعذر الرفع" و "جاري الرفع / تم الرفع بنجاح" =====
  get errorItems(): UploadItem[] {
    return this.uploadItems.filter(i => i.status === 'error');
  }

  get validItems(): UploadItem[] {
    return this.uploadItems.filter(i => i.status !== 'error');
  }

  get doneItems(): UploadItem[] {
    return this.uploadItems.filter(i => i.status === 'done');
  }

  get isUploadingAny(): boolean {
    return this.uploadItems.some(i => i.status === 'uploading');
  }

  get canSubmitUpload(): boolean {
    return this.uploadItems.length > 0 && this.uploadItems.every(i => i.status === 'done' && !i.error && i.category !== '');
  }

  uploadFiles() {
    if (!this.canSubmitUpload) return;

    // ===== TODO مهم لما الـ API يخلص =====
    // دلوقتي بنضيف كل ملف يدويًا للـ array المحلي عشان نشوف الشكل شغال.
    // لما نربط مع الباك اند، هنشيل الكود ده ونستبدله بـ:
    //   1) استدعاء POST /api/MedicalFile لكل عنصر في uploadItems برفعه فعليًا
    //      (باستخدام FormData يحتوي على الملف + الـ category المختار له)
    //   2) لو الرد نجح، هنضيف الملف اللي رجع من الـ Response (فيه id وurl حقيقي)
    //      بدل الملف الوهمي اللي عملناه هنا يدويًا
    const newFiles: MedicalFileItem[] = this.uploadItems.map(item => ({
      name: item.file.name,
      date: new Date().toISOString().split('T')[0],
      type: this.getFileType(item.file.name),
      size: this.formatSize(item.file.size),
      category: item.category as FileCategory
    }));

    this.files = [...newFiles, ...this.files];
    console.log('تم رفع الملفات:', newFiles);
    this.goBack();
  }

  private getFileType(fileName: string): 'PDF' | 'JPEG' | 'PNG' {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'png') return 'PNG';
    if (ext === 'jpg' || ext === 'jpeg') return 'JPEG';
    return 'PDF';
  }

  // بتحذف الملف من الليستة (Front-end بس دلوقتي)
  // TODO: لما الـ API يخلص، هنضيف هنا استدعاء DELETE /api/MedicalFile/{id}
  // ولو نجح الطلب، ساعتها بس نمسحه من الـ array
  deleteFile(file: MedicalFileItem) {
    const confirmed = confirm(`متأكد إنك عايز تحذف "${file.name}"؟`);
    if (!confirmed) return;
    this.files = this.files.filter(f => f !== file);
  }
}