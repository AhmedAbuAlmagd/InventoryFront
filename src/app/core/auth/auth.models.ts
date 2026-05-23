export type UserRole = 'Admin' | 'Employee';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  username: string;
  role: UserRole;
  expiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
}

export interface UserInfo {
  username: string;
  role: UserRole;
  expiresAtUtc: string;
}

