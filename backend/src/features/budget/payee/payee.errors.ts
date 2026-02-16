import { HttpError } from "../../../shared/errors";

export class PayeeNotFoundError extends HttpError {
  constructor() {
    super(
      "Payee not found or you do not have permission to access this payee.",
      404
    );
  }
}

export class PayeeAlreadyExistsError extends HttpError {
  constructor() {
    super("A payee with this name already exists.", 409);
  }
}

export class ReplacementPayeeIsInDeleteList extends HttpError {
  constructor() {
    super(
      "Replacement payee cannot be one of the payees being deleted. Please select a different replacement payee.",
      400
    );
  }
}

export class TargetPayeeIsInCombineList extends HttpError {
  constructor() {
    super(
      "Target payee cannot be one of the payees combining. Please select a different target payee.",
      400
    );
  }
}

export class PayeeInvariantError extends Error {
  constructor(
    message: string,
    readonly meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = "PayeeInvariantError";
  }
}

export class MissingSystemPayeesError extends PayeeInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super("Invariant violated: Missing system payees", meta);
    this.name = "MissingSystemPayeesError";
  }
}
