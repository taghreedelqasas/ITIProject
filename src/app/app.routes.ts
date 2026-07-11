import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NabdAi } from './components/nabd-ai/nabd-ai';
import { Booking } from './components/booking/booking';
import { Doctors } from './components/doctors/doctors';
import { DoctorProfile } from './components/doctor-profile/doctor-profile';
import { ConsultRequest } from './components/consult-request/consult-request';
import { DoctorChat } from './components/doctor-chat/doctor-chat';
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
import { DoctorAvailabilityComponent } from './DoctorDashboard/doctor-avaliabilty/doctor-avaliabilty';
import { AppointmentsListComponent } from './components/appointments-list-component/appointments-list-component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'nabd-ai', component: NabdAi },
  // { path: 'doctors', component: Doctors , canActivate: [authGuard] },
  { path: 'doctors', component: Doctors  },
  { path: 'doctor/:id', component: DoctorProfile },
  { path: 'booking', component: Booking },
  { path: 'profile', component: NavbarPatient ,
  children :[
    {path:'' ,redirectTo:'patientProfile' ,pathMatch: 'full'},
    {path:'patientProfile' , component:UserProfileComponent} ,
    {path:'medicalHistory' , component:MedicalHistory} ,
    {path:'appointment' , component:AppointmentsListComponent} ,
    {path:'PatientSetting' , component:DocSettings} ,
   
  ]
  },
  { path: 'consult', component: ConsultRequest },
  { path: 'doctor-dashboard/consultations/chat', component: DoctorChat },

  // مسار لوحة تحكم الطبيب بمساراتها الفرعية
  {
    path: 'doctor-dashboard',
    component: DoctorDash,
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: 'main', component: DocMain },
      { path: 'docSlots', component:DoctorAvailabilityComponent },
      { path: 'patients', component: DocPatients },
      { path: 'consultations', component: DocConsultations  },
      { path: 'analytics', component: DocAnalytics },
      { path: 'finance', component: DocPayments },
      { path: 'profile', component: DocProfile },
      { path: 'settings', component: DocSettings },
    ]
  },

  // Admin routes (lazy-loaded)
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
  } ,
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: 'auth/register',
    pathMatch: 'full'
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/confirm-email-notice',
    loadComponent: () => import('./features/auth/confirm-email-notice/confirm-email-notice.component').then(m => m.ConfirmEmailNoticeComponent)
  }
];
