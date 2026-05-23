import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  @Output() readonly menuToggled = new EventEmitter<void>();

  readonly username = computed(() => this.auth.user()?.username ?? '');
  readonly role = computed(() => this.auth.user()?.role ?? '');
  readonly initials = computed(() => {
    const raw = (this.username() || '').trim();
    if (!raw) return '?';
    const parts = raw.split(/[.\s_-]+/).filter(Boolean);
    const first = parts[0]?.[0] ?? raw[0];
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase();
  });

  readonly pageTitle = signal('Smart Inventory');

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.pageTitle.set(this.getDeepestTitle(this.route) ?? 'Smart Inventory');
      });

    this.pageTitle.set(this.getDeepestTitle(this.route) ?? 'Smart Inventory');
  }

  onToggleMenu(): void {
    this.menuToggled.emit();
  }

  logout(): void {
    this.auth.logout();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  private getDeepestTitle(route: ActivatedRoute): string | null {
    let current: ActivatedRoute | null = route;
    while (current?.firstChild) current = current.firstChild;
    const title = current?.snapshot?.data?.['title'];
    return typeof title === 'string' && title.trim() ? title : null;
  }
}
