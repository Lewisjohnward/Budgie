import { HttpError } from "./HttpError";

export class InflowCategoryGroupModificationError extends HttpError {
  constructor() {
    super("Cannot add or modify categories in the Inflow group.", 403);
  }
}

export class UnauthorizedAccountAccessError extends HttpError {
  constructor() {
    super("You do not have permission to access this account.", 403);
  }
}

export class DuplicateCategoryNameError extends HttpError {
  constructor() {
    super("A category with this name already exists in the group.", 400);
  }
}
