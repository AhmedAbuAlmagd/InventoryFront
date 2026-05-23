import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly breakpoints = inject(BreakpointObserver);

  readonly sidenavOpen = signal(true);
  readonly isMobile = signal(false);
  readonly isCollapsed = signal(false);

  constructor() {
    this.breakpoints
      .observe(['(max-width: 768px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        const wasMobile = this.isMobile();
        this.isMobile.set(result.matches);
        if (result.matches) this.sidenavOpen.set(false);
        else if (wasMobile) this.sidenavOpen.set(true);
      });

    this.breakpoints
      .observe(['(max-width: 1024px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.isCollapsed.set(result.matches && !this.isMobile());
      });
  }

  toggleSidenav(): void {
    this.sidenavOpen.update((v) => !v);
  }
}
