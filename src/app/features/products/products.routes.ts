import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./products-list/products-list.component').then((c) => c.ProductsListComponent),
    data: { title: 'Products' },
  },
  {
    path: 'add',
    loadComponent: () => import('./product-form/product-form.component').then((c) => c.ProductFormComponent),
    canActivate: [roleGuard(['Admin'])],
    data: { title: 'Add Product' },
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./product-form/product-form.component').then((c) => c.ProductFormComponent),
    canActivate: [roleGuard(['Admin'])],
    data: { title: 'Edit Product' },
  },
];
