import { ApiResponse } from '../models/api-response.model';

export function requireData<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    throw new Error(response.error?.message ?? 'Request failed');
  }
  return response.data;
}

