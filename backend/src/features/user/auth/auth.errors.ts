import { HttpError } from "../../../shared/errors";

export class MissingCredentialsError extends HttpError {
  constructor() {
    super("Missing credentials", 400);
  }
}

export class EmailAlreadyRegisteredError extends HttpError {
  constructor() {
    super("This email is already registered", 409);
  }
}

export class InvalidOrExpiredRefreshTokenError extends HttpError {
  constructor() {
    super("Invalid or expired refresh token", 401);
  }
}

export class InvalidCredentialsError extends HttpError {
  constructor() {
    super("Invalid credentials", 401);
  }
}

export class RefreshTokenNoUserFoundError extends HttpError {
  constructor() {
    super(
      "No user found with the provided refresh token. Please log in again.",
      403
    );
  }
}
