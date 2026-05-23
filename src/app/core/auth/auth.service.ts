import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, LoginResponse, UserInfo, UserRole } from './auth.models';

function requireData<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    throw new Error(response.error?.message ?? 'Request failed');
  }
  return response.data;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly STORAGE_TOKEN_KEY = 'auth.token';
  private readonly STORAGE_USER_KEY = 'auth.user';

  private readonly _token = signal<string | null>(null);
  private readonly _user = signal<UserInfo | null>(null);
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._token() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');

  constructor() {
    this.restoreFromStorage();
  }

  login(request: LoginRequest) {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/api/auth/login`, request, {
        withCredentials: true,
      })
      .pipe(
        map(requireData),
        tap((response) => {
          this._token.set(response.token);
          this._user.set({
            username: response.username,
            role: response.role,
            expiresAtUtc: response.expiresAtUtc,
          });

          this.persistToStorage();
          this.scheduleLogout(response.expiresAtUtc);
        }),
        map(() => void 0),
      );
  }

  logout(): void {
    this.clearLogoutTimer();

    this._token.set(null);
    this._user.set(null);
    this.clearStorage();
    void this.router.navigate(['/auth/login']);
  }

  hasRole(roles: readonly UserRole[]): boolean {
    const role = this._user()?.role;
    return role ? roles.includes(role) : false;
  }

  private restoreFromStorage(): void {
    try {
      const token = localStorage.getItem(this.STORAGE_TOKEN_KEY);
      const rawUser = localStorage.getItem(this.STORAGE_USER_KEY);
      if (!token || !rawUser) return;

      const user = JSON.parse(rawUser) as Partial<UserInfo> | null;
      if (!user || typeof user.username !== 'string' || typeof user.role !== 'string' || typeof user.expiresAtUtc !== 'string') {
        this.clearStorage();
        return;
      }

      this._token.set(token);
      this._user.set({ username: user.username, role: user.role as UserRole, expiresAtUtc: user.expiresAtUtc });
      this.scheduleLogout(user.expiresAtUtc);
    } catch {
      this.clearStorage();
    }
  }

  private persistToStorage(): void {
    const token = this._token();
    const user = this._user();
    if (!token || !user) return;

    try {
      localStorage.setItem(this.STORAGE_TOKEN_KEY, token);
      localStorage.setItem(this.STORAGE_USER_KEY, JSON.stringify(user));
    } catch {
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_TOKEN_KEY);
      localStorage.removeItem(this.STORAGE_USER_KEY);
    } catch {
    }
  }

  private clearLogoutTimer(): void {
    if (!this.logoutTimer) return;
    clearTimeout(this.logoutTimer);
    this.logoutTimer = null;
  }

  private scheduleLogout(expiresAtUtc: string): void {
    this.clearLogoutTimer();

    const expiresAt = new Date(expiresAtUtc).getTime();
    if (!Number.isFinite(expiresAt)) return;

    const ms = expiresAt - Date.now();
    if (!Number.isFinite(ms) || ms <= 0) return;

    this.logoutTimer = setTimeout(() => this.logout(), ms);
  }
}
