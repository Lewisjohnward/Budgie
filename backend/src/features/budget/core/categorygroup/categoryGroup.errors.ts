import { HttpError } from "../../../../shared/errors";
// TODO:(lewis 2026-02-17 00:04) these types need sorting

export class UnableToFindProtectedCategoriesInDBError extends HttpError {
  constructor() {
    super("Unable to find protected categories in database", 403);
  }
}

export class ModifyingCategoryToProtectedCategoryGroupError extends HttpError {
  constructor() {
    super("Modifying a category a protected category group is prohibited", 403);
  }
}

export class NoCategoryGroupFoundError extends HttpError {
  constructor() {
    super("Unable to find category group", 404);
  }
}

export class CategoryGroupNameConflictError extends HttpError {
  constructor(name?: string) {
    super(
      name
        ? `Category group "${name}" already exists`
        : "Category group name already exists",
      409
    );
  }
}

export class CategoryGroupNotFoundError extends HttpError {
  constructor() {
    super("Category group not found", 404);
  }
}

/**
 * Thrown when a category group is moved to an invalid position
 * outside the reorderable user category group range.
 */
export class InvalidCategoryGroupPositionError extends HttpError {
  constructor() {
    super("Invalid category group position", 400);
  }
}
