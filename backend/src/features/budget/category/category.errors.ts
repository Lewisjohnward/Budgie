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
    super("Category not found", 404);
  }
}

export class InheritingCategoryIdNotProvidedError extends HttpError {
  constructor() {
    super(
      "You must provide an inheriting category ID to transfer transactions to.",
      400
    );
  }
}

export class MonthNotFoundError extends HttpError {
  constructor() {
    super("Month not found", 404);
  }
}

export class DeletingProtectedCategoryError extends HttpError {
  constructor() {
    super("You are not allowed to delete to protected categories.", 403);
  }
}

export class CategoryInvariantError extends Error {
  constructor(
    message: string,
    readonly meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = "CategoryInvariantError";
  }
}

export class RTACategoryIdNotFound extends CategoryInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super("Invariant violated: RTA category id not found", meta);
    this.name = "MissingRTACategoryId";
  }
}

export class UncategorisedCategoryIdNotFound extends CategoryInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super("Invariant violated: RTA category id not found", meta);
    this.name = "MissingRTACategoryId";
  }
}

export class NoPastMonthsFoundError extends CategoryInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super("Invariant violated: Past months not found", meta);
    this.name = "NoPastMonthsFoundError";
  }
}
