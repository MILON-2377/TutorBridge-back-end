export default class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational?: boolean;
  public readonly message: string;

  constructor(statusCode: number, message: string, isOperational?: boolean) {
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = isOperational;
  }

  static badRequest(message: string = "Bad Request"): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = "forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = "Not Found"): ApiError {
    return new ApiError(404, message);
  }

  static error(message: string): ApiError{
    return new ApiError(400, message)
  }
}
