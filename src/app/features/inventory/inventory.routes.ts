import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: 'history',
    loadComponent: () => import('./inventory-history/inventory-history.component').then((c) => c.InventoryHistoryComponent),
    data: { title: 'Inventory History' },
  },
  {
    path: 'in',
    loadComponent: () => import('./inventory-in/inventory-in.component').then((c) => c.InventoryInComponent),
    data: { title: 'Stock In' },
  },
  {
    path: 'out',
    loadComponent: () => import('./inventory-out/inventory-out.component').then((c) => c.InventoryOutComponent),
    data: { title: 'Stock Out' },
  },
];
