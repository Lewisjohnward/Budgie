import { HttpError } from "./HttpError";

export class UserNotAuthorisedError extends HttpError {
  constructor() {
    super("User not authorised", 401);
  }
}

export class MissingOrMalformedAuthorizationHeaderError extends HttpError {
  constructor() {
    super("Missing or malformed authorization header", 401);
  }
}

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
