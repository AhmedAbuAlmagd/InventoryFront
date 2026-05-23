import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../core/auth/auth.service';

type NavItem = {
  label: string;
  icon: string;
  link: string;
  adminOnly?: boolean;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatListModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  readonly version = 'v1.0.0';

  readonly items = computed<NavItem[]>(() => {
    const isAdmin = this.auth.isAdmin();
    const all: NavItem[] = [
      { label: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
      { label: 'Products', icon: 'inventory_2', link: '/products' },
      { label: 'Inventory History', icon: 'history', link: '/inventory/history' },
      { label: 'Stock In', icon: 'add_circle_outline', link: '/inventory/in' },
      { label: 'Stock Out', icon: 'remove_circle_outline', link: '/inventory/out' },
      { label: 'Add Product', icon: 'lock', link: '/products/add', adminOnly: true },
    ];

    return isAdmin ? all : all.filter((x) => !x.adminOnly);
  });
}
