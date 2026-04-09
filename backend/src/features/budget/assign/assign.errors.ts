import { HttpError } from "../../../shared/errors";

export class AssigningToProtectedCategoryMonthError extends HttpError {
  constructor() {
    super("Cannot assign to protected category", 403);
  }
}

export class DuplicateMonthIdError extends HttpError {
  constructor() {
    super("Duplicate monthId detected in request", 400);
  }
}

export class MonthNotFoundError extends HttpError {
  constructor() {
    super("One or more months could not be found", 400);
  }
}

export class MonthsNotSameDateError extends HttpError {
  constructor() {
    super("All months must share the same date", 400);
  }
}
