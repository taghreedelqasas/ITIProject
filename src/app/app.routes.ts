import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NabdAi } from './components/nabd-ai/nabd-ai';
import { Booking } from './components/booking/booking';
import { StepDateTime } from './components/booking/step-date-time/step-date-time';
import { StepPatientData } from './components/booking/step-patient-data/step-patient-data';
import { StepReviewConfirm } from './components/booking/step-review-confirm/step-review-confirm';
import { StepBookingSuccess } from './components/booking/step-booking-success/step-booking-success';
import { Doctors } from './components/doctors/doctors';
import { DoctorProfile } from './components/doctor-profile/doctor-profile';
import { ConsultRequest } from './components/consult-request/consult-request';
import { DoctorChat } from './components/doctor-chat/doctor-chat';
import { ChatComponent } from './components/chat/chat';
import { LoginComponent } from './features/auth/login/login.component';

// Doctor dashboard components
import { DoctorDash } from './DoctorDashboard/doctor-dash/doctor-dash';
import { DocMain } from './DoctorDashboard/doc-main/doc-main';
import { DocPatients } from './DoctorDashboard/doc-patients/doc-patients';
import { DocConsultations } from './DoctorDashboard/doc-consulations/doc-consulations';
import { DocAnalytics } from './DoctorDashboard/doc-analytics/doc-analytics';
import { DocPayments } from './DoctorDashboard/doc-payments/doc-payments';
import { DocProfile } from './DoctorDashboard/doc-profile/doc-profile';
import { DocSettings } from './DoctorDashboard/doc-settings/doc-settings';
import { authGuard } from './core/services/auth.guard';
import { NavbarPatient } from './components/navbar-patient/navbar-patient';
import { UserProfileComponent } from './components/features/profile/profile';
import { MedicalHistory } from './components/medical-history/medical-history';

// Imports from both branches resolved
import { ConfirmEmailComponent } from './features/auth/confirm-email/confirm-email.component';
import { DoctorAvailabilityComponent } from './DoctorDashboard/doctor-avaliabilty/doctor-avaliabilty';
import { AppointmentsListComponent } from './components/appointments-list-component/appointments-list-component';
import { DoctorReviewCardComponent } from './components/doctor-review-card-component/doctor-review-card-component';
import { RatingsPageComponent } from './components/ratings-page-component/ratings-page-component';

import { AiChat } from './components/ai-chat/ai-chat';


import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

export const routes: Routes = [
  // If the path is empty, we default to Home. 
  // (Note: 'main' branch had a conflicting redirect to auth/register on empty path. 
  // Keeping Home component as the default root path, but you can adjust if register is meant to be the true default.)
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'nabd-ai', component: NabdAi },
  { path: 'doctors', component: Doctors },
  { path: 'doctor/:id', component: DoctorProfile },

  // Booking process wizard
  {
    path: 'booking',
    component: Booking,
    children: [
      { path: '', redirectTo: 'date-time', pathMatch: 'full' },
      { path: 'date-time', component: StepDateTime },
      { path: 'patient-data', component: StepPatientData },
      { path: 'review', component: StepReviewConfirm },
      { path: 'success', component: StepBookingSuccess },
    ]
  },

  // Patient Profile section
  {
    path: 'profile', 
    component: NavbarPatient,
    children: [
      { path: '', redirectTo: 'patientProfile', pathMatch: 'full' },
      { path: 'patientProfile', component: UserProfileComponent },
      { path: 'medicalHistory', component: MedicalHistory },
      { path: 'appointment', component: AppointmentsListComponent },
      { path: 'PatientSetting', component: DocSettings },
    ]
  },

  { path: 'consult', component: ConsultRequest },
  { path: 'chat', component: ChatComponent },
  { path: 'ai-pulse', component: AiChat },

  // Doctor Dashboard sub-routes
  {
    path: 'doctor-dashboard',
    component: DoctorDash,
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: 'main', component: DocMain },
      { path: 'docSlots', component: DoctorAvailabilityComponent },
      { path: 'patients', component: DocPatients },
      { path: 'consultations', component: DocConsultations },

      { path: 'consultations/chat', component: ChatComponent },


      { path: 'analytics', component: DocAnalytics },
      { path: 'finance', component: DocPayments },
      { path: 'profile', component: DocProfile },
      { path: 'settings', component: DocSettings },
    ]
  },

  // Admin routes (Lazy-loaded)
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'admin/patients',
    loadComponent: () => import('./components/features/patients-management/patients-management.component').then(m => m.PatientsManagementComponent),
  },
  {
    path: 'admin/doctors',
    loadComponent: () => import('./components/features/doctors-management/doctors-management.component').then(m => m.DoctorsManagementComponent),
  },

  // Authentication & Verification paths
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/confirm-email-notice',
    loadComponent: () => import('./features/auth/confirm-email-notice/confirm-email-notice.component').then(m => m.ConfirmEmailNoticeComponent)
  },
  {
    path: 'auth/doctor-info',
    loadComponent: () => import('./features/auth/doctor-info/doctor-info.component').then(m => m.DoctorInfoComponent)
  },
  { 
    path: 'confirm-email', 
    component: ConfirmEmailComponent 
  },
  { 
    path: 'api/auth/confirm-email', 
    component: ConfirmEmailComponent
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent)
  },
  { path: 'auth/reset-password', 
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent)
  },
   {
    path: 'api/auth/reset-password',
    component: ResetPasswordComponent
  }
];
