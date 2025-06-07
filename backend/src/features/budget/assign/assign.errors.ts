import { HttpError } from "../../../shared/errors";

export class AssigningToUncategorisedCategoryMonthError extends HttpError {
  constructor() {
    super("You do not have permission to access this account.", 403);
  }
}