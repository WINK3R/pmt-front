import { Routes } from '@angular/router';
import {authGuard} from './core/guards/auth/authGuard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'signup' },
  { path: 'signup', loadComponent: () => import('./core/features/signup/signup').then(m => m.Signup) },
  { path: 'signin', loadComponent: () => import('./core/features/signin/signin').then(m => m.Signin) },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/features/dashboard/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'projects' },
      {
        path: 'projects',
        loadComponent: () =>
          import('./core/features/dashboard/pages/projects/projects').then(m => m.Projects),
      },
    ],
  },
];
