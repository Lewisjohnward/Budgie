import { HttpError } from "../../../shared/errors";

export class AccountNotFoundError extends HttpError {
  constructor() {
    super("Unable to find account", 404);
  }
}

export class DuplicateAccountNameError extends HttpError {
  constructor() {
    super("Account with this name already exists", 409);
  }
}

export class CannotCloseDeletableAccountError extends HttpError {
  constructor() {
    super(
      "Cannot close an account without user transactions. Delete it instead.",
      409
    );
  }
}

export class CannotDeleteUndeletableAccountError extends HttpError {
  constructor() {
    super("Cannot delete an account that has user transactions.", 409);
  }
}

export class AccountAlreadyClosedError extends HttpError {
  constructor() {
    super("Cannot close account: it is already closed", 409);
  }
}
