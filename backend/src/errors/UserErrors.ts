import { HttpError } from "./HttpError";

export class InvalidOrExpiredRefreshTokenError extends HttpError {
  constructor() {
    super("Invalid or expired refresh token", 401);
  }
}

export class InvalidCredentialsError extends HttpError {
  constructor() {
    super("Invalid credentials", 422);
  }
}
