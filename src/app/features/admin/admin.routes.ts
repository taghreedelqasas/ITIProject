// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard-overview.component').then(
            (m) => m.DashboardOverviewComponent
          ),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./patients/patients-list.component').then((m) => m.PatientsListComponent),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./appointments/appointments-list.component').then(
            (m) => m.AppointmentsListComponent
          ),
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./doctors/doctors-list.component').then((m) => m.DoctorsListComponent),
      },
      // باقي الشاشات (payments, support, analytics, settings)
      // هتتضاف هنا لما نبنيها، كل واحدة كـ route منفصل جوه children.
    ],
  },
];

// في app.routes.ts الرئيسي بتاعك ضيفي:
//
// { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) }
