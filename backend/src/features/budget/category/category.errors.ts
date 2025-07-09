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

export class AddingToCategoryGroupNotOwnedByUserError extends HttpError {
  constructor() {
    super("You are not allowed to add categories to this category group.", 403);
  }
}

export class CategoryNotFoundError extends HttpError {
  constructor() {
    super("Category not found or not owned by user.", 404);
  }
}

export class InheritingCategoryIdNotProvidedError extends HttpError {
  constructor() {
    super(
      "You must provide an inheriting category ID to transfer transactions to.",
      400,
    );
  }
}

export class AddingTransactionToProtectedCategoryError extends HttpError {
  constructor() {
    super(
      "You are not allowed to add transactions to protected categories.",
      403,
    );
  }
}
