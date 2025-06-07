import { HttpError } from "../../../shared/errors";

export class UnableToFindProtectedCategoriesInDBError extends HttpError {
  constructor() {
    super("Unable to find protected categories in database", 403);
  }
}

export class DuplicateCategoryNameError extends HttpError {
  constructor() {
    super("A category with this name already exists in the group.", 409);
  }
}

export class AddingTransactionToProtectedCategoryGroupError extends HttpError {
  constructor() {
    super(
      "Adding a transaction to a protected category group is prohibited",
      403,
    );
  }
}