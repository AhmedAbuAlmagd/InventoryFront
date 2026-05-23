import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent),
    data: { title: 'Sign In' },
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
