import { HttpError } from "./HttpError";

export class UnauthorizedAccountAccessError extends HttpError {
  constructor() {
    super("You do not have permission to access this account.", 403);
  }
}
