export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface ApiErrorResponse {
  detail: string;
}
