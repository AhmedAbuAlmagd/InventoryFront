import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from './auth.models';

export const roleGuard = (roles: readonly UserRole[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/auth/login']);
  if (!auth.hasRole(roles)) return router.createUrlTree(['/dashboard']);
  return true;
};

