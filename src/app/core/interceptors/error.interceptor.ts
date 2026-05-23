import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ApiResponse } from '../models/api-response.model';

function tryGetApiErrorMessage(error: unknown): string | null {
  const body = error as Partial<ApiResponse<unknown>> | null;
  const msg = body?.error?.message;
  return typeof msg === 'string' && msg.trim() ? msg : null;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiMessage = tryGetApiErrorMessage(error.error);

      switch (error.status) {
        case 401:
          auth.logout();
          break;
        case 403:
          snackBar.open('You do not have permission to perform this action.', 'Close', { duration: 4000 });
          break;
        case 404:
          snackBar.open('Resource not found.', 'Close', { duration: 3000 });
          break;
        case 409:
        case 400:
          break;
        default:
          snackBar.open(apiMessage ?? 'An unexpected error occurred. Please try again.', 'Close', { duration: 4000 });
      }

      return throwError(() => error);
    }),
  );
};

