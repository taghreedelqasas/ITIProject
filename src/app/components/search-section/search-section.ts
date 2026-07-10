import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-section.html',
  styleUrl: './search-section.css',
})
export class SearchSection {
  constructor(private router: Router) {}

  pageTitle = 'الأطباء';
  pageSubtitle = 'ابحث عن طبيبك المناسب من بين أكثر من 200 متخصص';

  specialties: string[] = [
    'جراحة العظام',
    'أمراض القلب',
    'الجلدية',
    'الأطفال',
    'النساء والتوليد',
    'الأنف والأذن والحنجرة',
    'المخ والأعصاب',
    'الأسنان',
  ];

  selectedSpecialty = '';
  selectedLocation = '';
  selectedDate = '';
  searchQuery = '';

  onSearch(): void {
    this.router.navigate(['/doctors'], {
      queryParams: {
        search: this.searchQuery || undefined,
        specialty: this.selectedSpecialty || undefined,
        location: this.selectedLocation || undefined,
        date: this.selectedDate || undefined,
      },
    });
  }
}