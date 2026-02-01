interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default class ApiResponse<T = any> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly errors?: string | null;
  public readonly data?: T | null;
  public readonly pagination?: Pagination;

  constructor(
    statusCode: number,
    message: string,
    data?: T | null,
    errors?: string | null,
    pagination?: Pagination
  ) {
    if (statusCode < 100 || statusCode > 599) {
      throw new Error(`Invalid HTTP status code: ${statusCode}`);
    }

    this.success = statusCode >= 200 && statusCode < 300;

    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.pagination = pagination;
  }

  static success<T>(
    message: string = "success",
    data: T,
    pagination?: Pagination
  ): ApiResponse<T> {
    return new ApiResponse<T>(200, message, data, null, pagination);
  }

  static created<T>(
    data: T,
    message: string = "Resource created successfully"
  ): ApiResponse<T> {
    return new ApiResponse<T>(201, message, data);
  }

  static noContent(message: string = "No Content"): ApiResponse {
    return new ApiResponse(204, message);
  }

  static error (message: string, error: string): ApiResponse {
     return new ApiResponse(400, message, null, error);
  }
}
