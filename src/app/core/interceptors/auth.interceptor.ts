import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  if (!isApiRequest) return next(req);

  const token = auth.token();
  if (!token) {
    return next(
      req.clone({
        withCredentials: true,
      }),
    );
  }

  return next(
    req.clone({
      withCredentials: true,
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};

