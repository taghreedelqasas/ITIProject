import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicalFileService } from '../../core/services/medicalFile.service';
import { HttpEventType } from '@angular/common/http';
type FileCategory = 'report' | 'prescription' | 'radiology' | 'lab';

interface MedicalFileItem {
  id: number;
  name: string;
  date: string;
  type: 'PDF' | 'JPEG' | 'PNG';
  size: string;
  category: FileCategory;
  fileUrl: string;
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
export class MedicalHistory implements OnInit {
 constructor(
  private cdr: ChangeDetectorRef,
  private medicalService: MedicalFileService
) {}


ngOnInit(): void {
  this.loadFiles();
  this.loadSummary();
}



loadFiles() {

  this.medicalService.getFiles().subscribe({

    next: (res) => {

      this.files = res.map(file => ({

        id: file.id,

        name: file.fileName,

        date: file.uploadedAtUtc.split('T')[0],

        type: this.getFileType(file.fileType),

        size: this.formatSize(file.fileSizeInBytes),

        category: this.mapCategory(file.category),

        fileUrl: 'https://mawed.runasp.net' + file.fileUrl

      }));
this.cdr.detectChanges();
    }

  });

}
loadSummary() {

  this.medicalService.getSummary().subscribe({

    next: res => {

      this.summary = res;
      this.cdr.detectChanges();

    }

  });

}
mapCategory(category: number): FileCategory {

  switch (category) {

    case 0:
      return 'lab';

    case 1:
      return 'radiology';

    case 2:
      return 'prescription';

    case 3:
      return 'report';

    default:
      return 'lab';
  }

}

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

files: MedicalFileItem[] = [];

summary = {
  labResultCount: 0,
  scanCount: 0,
  prescriptionCount: 0,
  medicalReportCount: 0,
  totalCount: 0
};

  // عدد الملفات لكل تصنيف بيتحسب أوتوماتيك من طول القائمة أعلاه
get categories(): CategoryInfo[] {

  return [

    {
      key: 'lab',
      label: 'التحاليل الطبية',
      count: this.summary.labResultCount
    },

    {
      key: 'radiology',
      label: 'الأشعة',
      count: this.summary.scanCount
    },

    {
      key: 'prescription',
      label: 'الوصفات الطبية',
      count: this.summary.prescriptionCount
    },

    {
      key: 'report',
      label: 'التقارير الطبية',
      count: this.summary.medicalReportCount
    }

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
  item.status = 'done';
  item.progress = 100;
}
    });
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

  let completed = 0;

  this.uploadItems.forEach(item => {
    const formData = new FormData();
    formData.append('File', item.file);
    
    if (item.category === '') return;
    
    formData.append('Category', this.getApiCategory(item.category).toString());

    this.medicalService.upload(formData).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress) {
          item.progress = Math.round(100 * event.loaded / (event.total ?? item.file.size));
        }

        if (event.type === HttpEventType.Response) {
          completed++;

          // عند اكتمال رفع جميع الملفات بنجاح
          if (completed === this.uploadItems.length) {
            this.loadFiles();
            this.loadSummary();
            this.goBack();
            
            // ===== السطر السحري لتحديث الشاشة فوراً وإظهار الملفات الجديدة =====
            this.cdr.detectChanges(); 
          }
        }
      },
      error: () => {
        item.status = 'error';
        item.error = 'فشل رفع الملف';
        this.cdr.detectChanges(); // لتحديث حالة الخطأ على الواجهة أيضاً
      }
    });
  });
}
getApiCategory(category: FileCategory): number {

  switch (category) {

    case 'lab':
      return 0;

    case 'radiology':
      return 1;

    case 'prescription':
      return 2;

    case 'report':
      return 3;

    default:
      return 0;
  }

}

private getFileType(
  ext: string
): 'PDF' | 'JPEG' | 'PNG' {

  ext = ext.toLowerCase();

  if (ext.includes('png'))
    return 'PNG';

  if (
    ext.includes('jpg') ||
    ext.includes('jpeg')
  )
    return 'JPEG';

  return 'PDF';

}

  // بتحذف الملف من الليستة (Front-end بس دلوقتي)
  // TODO: لما الـ API يخلص، هنضيف هنا استدعاء DELETE /api/MedicalFile/{id}
  // ولو نجح الطلب، ساعتها بس نمسحه من الـ array
deleteFile(file: MedicalFileItem) {
  if (!confirm('متأكد من حذف الملف؟')) return;

  this.medicalService.delete(file.id).subscribe({
    next: () => {
      // لو الباك اند رجع استجابة عادية
      this.files = this.files.filter(x => x.id !== file.id);
      this.loadSummary();
      this.cdr.detectChanges(); 
    },
    error: (err) => {
      // لو دخل هنا بسبب إن الرد فاضي (Parsing Error) بس الداتا اتحذفت فعلاً
      // هنتأكد لو الخطأ بسبب الـ parsing والـ status بوجة عام نجاح (200 أو 204)
      if (err.status === 200 || err.status === 204 || err.statusText === 'OK') {
        this.files = this.files.filter(x => x.id !== file.id);
        this.loadSummary();
        this.cdr.detectChanges();
      } else {
        // لو فعلاً سيرفر واقع أو مشكلة حقيقية
        alert('حدث خطأ أثناء حذف الملف');
      }
    }
  });
}
viewFile(file: MedicalFileItem) {

  window.open(file.fileUrl, '_blank');

}
}