import { HttpError } from "../../../shared/errors";

export class UnableToFindProtectedCategoriesInDBError extends HttpError {
  constructor() {
    super("Unable to find protected categories in database", 403);
  }
}

export class AddingCategoryToProtectedCategoryGroupError extends HttpError {
  constructor() {
    super("Adding a category to a protected category group is prohibited", 403);
  }
}

export class NoCategoryGroupFoundError extends HttpError {
  constructor() {
    super("Unable to find category group", 403);
  }
}

export class DuplicateCategoryGroupNameError extends HttpError {
  constructor() {
    super("Unable to find category group", 409);
  }
}

export class CategoryGroupNotFoundError extends HttpError {
  constructor() {
    super("Category group not found", 404);
  }
}
