export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: boolean;
  message: string;
}
