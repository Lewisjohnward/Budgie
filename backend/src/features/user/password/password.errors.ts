import { HttpError } from "../../../shared/errors/HttpError";

export class EmailRequiredError extends HttpError {
  constructor() {
    super("Email is required", 400);
  }
}

export class PasswordRequiredError extends HttpError {
  constructor() {
    super("Current password and new password are required", 400);
  }
}

export class CurrentPasswordIncorrectError extends HttpError {
  constructor() {
    super("Current password is incorrect", 400);
  }
}

export class CurrentPasswordNewPasswordError extends HttpError {
  constructor() {
    super("Current password and new password are required", 400);
  }
}