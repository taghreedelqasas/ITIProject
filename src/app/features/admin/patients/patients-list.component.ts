// src/app/features/admin/patients/patients-list.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { AdminPeopleService } from '../../../core/services/admin-people.service';
import { AdminPatientDto } from '../../../core/models/admin-dashboard.models';
import { formatCount } from '../../../core/utils/number-format.util';
import { PatientProfilePanelComponent } from './patient-profile-panel.component';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientProfilePanelComponent],
  templateUrl: './patients-list.component.html',
})
export class PatientsListComponent implements OnInit {
  loading = true;
  error = false;

  private allPatients: AdminPatientDto[] = [];

  searchTerm = '';
  sortDirection: SortDirection = 'asc';

  pageSize = 8;
  currentPage = 1;

  selectedIds = new Set<number>();

  constructor(private readonly peopleService: AdminPeopleService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = false;

    this.peopleService
      .getAllPatients()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (patients) => (this.allPatients = patients),
        error: () => (this.error = true),
      });
  }

  // ===== فلترة + ترتيب (Client-side) - مفيش search/sort params في الـ API =====
  get filteredPatients(): AdminPatientDto[] {
    const term = this.searchTerm.trim().toLowerCase();

    let result = term
      ? this.allPatients.filter((p) => p.fullName.toLowerCase().includes(term))
      : this.allPatients;

    result = [...result].sort((a, b) =>
      this.sortDirection === 'asc'
        ? a.fullName.localeCompare(b.fullName, 'ar')
        : b.fullName.localeCompare(a.fullName, 'ar')
    );

    return result;
  }

  toggleSort(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  // ===== Pagination (Client-side) =====
  get totalCount(): number {
    return this.filteredPatients.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  get pagedPatients(): AdminPatientDto[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPatients.slice(start, start + this.pageSize);
  }

  get rangeStart(): number {
    return this.totalCount === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  // ===== الاختيار (شكلي حاليًا - مفيش bulk action مربوطة بيه في الباك) =====
  isAllSelectedOnPage(): boolean {
    return this.pagedPatients.length > 0 && this.pagedPatients.every((p) => this.selectedIds.has(p.id));
  }

  toggleSelectAllOnPage(): void {
    if (this.isAllSelectedOnPage()) {
      this.pagedPatients.forEach((p) => this.selectedIds.delete(p.id));
    } else {
      this.pagedPatients.forEach((p) => this.selectedIds.add(p.id));
    }
  }

  toggleSelect(id: number): void {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }

  // ===== عرض الملف الشخصي: Panel جانبي بيجيب بروفايل كامل من api/admin/patients/{id} =====
  selectedPatientId: number | null = null;

  openProfile(patient: AdminPatientDto): void {
    this.selectedPatientId = patient.id;
  }

  closeProfile(): void {
    this.selectedPatientId = null;
  }

  formatCount = formatCount;

  initials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }
}
