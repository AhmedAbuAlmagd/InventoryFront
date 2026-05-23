export interface ApiError {
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  durationMs: number;
  requestId: string;
  data: T | null;
  error?: ApiError;
}

