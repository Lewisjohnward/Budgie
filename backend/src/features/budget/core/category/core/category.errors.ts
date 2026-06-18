import { HttpError } from "../../../../../shared/errors";

export class UnableToFindProtectedCategoriesInDBError extends HttpError {
  constructor() {
    super("Unable to find protected categories in database", 403);
  }
}

/** Error thrown when attempting to create or rename a category to a name that already exists within the target group. */
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
      422
    );
  }
}

/** Error thrown when inheriting category is original category*/
export class CategoryCannotInheritItselfError extends HttpError {
  constructor() {
    super(
      "A category cannot inherit its own transactions during deletion.",
      422
    );
  }
}

export class MonthNotFoundError extends HttpError {
  constructor() {
    super("Month not found", 404);
  }
}

export class ModifyingAProtectedCategoryError extends HttpError {
  constructor() {
    super("You are not allowed to modified to protected categories.", 403);
  }
}

export class InvalidCategoryPositionError extends HttpError {
  constructor() {
    super("Invalid category group position", 400);
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

/**
 * Thrown when the number of created months does not match the expected number,
 * indicating a violation of the month creation invariant.
 */
export class MonthCreationMismatchError extends CategoryInvariantError {
  constructor(expected: number, actual: number) {
    super(`Expected ${expected} months but got ${actual}`);
    this.name = "MonthCreationMismatchError";
  }
}
