import { HttpError } from "../../../shared/errors";

export class AccountNotFoundError extends HttpError {
  constructor() {
    super("Unable to find account", 404);
  }
}
