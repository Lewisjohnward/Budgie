import { HttpError } from "../../../shared/errors";

/**
 * Thrown when a memo does not exist or is not owned by the user.
 */

export class NoMemoFoundError extends HttpError {
  constructor() {
    super("Memo not found", 404);
  }
}

/**
 * Thrown when a memo system invariant is violated.
 *
 * Indicates a backend consistency error rather than a user mistake.
 */

export class MemoInvariantError extends HttpError {
  constructor(message?: string) {
    super(message ?? "Memo invariant violated", 500);
  }
}
