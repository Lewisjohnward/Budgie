import { HttpError } from "./HttpError";

export class UnableToFindProtectedCategoriesInDBError extends HttpError {
  constructor() {
    super("Unable to find protected categories in database", 403);
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

export class UnauthorizedAccountAccessError extends HttpError {
  constructor() {
    super("You do not have permission to access this account.", 403);
  }
}

export class DuplicateCategoryNameError extends HttpError {
  constructor() {
    super("A category with this name already exists in the group.", 409);
  }
}

export class AddTransactionToFutureError extends HttpError {
  constructor() {
    super("Unable to add a transaction in the future", 400);
  }
}

export class AssigningToUncategorisedCategoryMonthError extends HttpError {
  constructor() {
    super(
      "Assigning to an uncategorised category month is prohibited",
      403,
    );
  }
}
