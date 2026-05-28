import { HttpError } from "../../../../shared/errors";
// TODO:(lewis 2026-02-17 00:04) these types need sorting

export class UnableToFindProtectedCategoriesInDBError extends HttpError {
  constructor() {
    super("Unable to find protected categories in database", 403);
  }
}

export class ModifyingAProtectedCategoryGroupError extends HttpError {
  constructor() {
    super("Modifying a protected category group is prohibited", 403);
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

/**
 * Thrown when a category group has an unknown or unsupported source type.
 *
 * This indicates a data integrity issue or a mismatch between database values
 * and the domain `CategoryGroupSource` enum.
 */
export class UnknownCategoryGroupSourceError extends HttpError {
  constructor(source: never) {
    super(`Unknown category group source: ${String(source)}`, 500);
  }
}

/**
 * Thrown when a category group mapper for USER groups receives a row
 * with an invalid or unexpected source type.
 *
 * This indicates a violation of domain assumptions or a data integrity issue
 * between persistence and domain mapping layers.
 */
export class InvalidCategoryGroupSourceForUserMapperError extends HttpError {
  constructor(source: string) {
    super(`Expected USER category group, received: ${source}`);
  }
}

/**
 * Thrown when a USER category group is missing its required `position` field.
 *
 * In the domain model, USER category groups must always have a defined position
 * for ordering purposes. A null value indicates corrupted or invalid persisted state.
 */
export class CategoryGroupMissingPositionError extends HttpError {
  constructor(id: string) {
    super(`Invalid state: USER category group has null position (id: ${id})`);
  }
}

/**
 * Thrown when a SYSTEM category group mapper receives a row
 * with an invalid or unexpected source type.
 *
 * This indicates a violation of domain assumptions or a data integrity issue
 * between persistence and domain mapping layers.
 */
export class InvalidCategoryGroupSourceForSystemMapperError extends HttpError {
  constructor(source: string) {
    super(`Expected SYSTEM category group, received: ${source}`);
  }
}

/**
 * Thrown when a SYSTEM category group has an invalid `position` value.
 *
 * In the domain model, SYSTEM category groups must always have a `null` position,
 * since ordering is not applicable. A non-null value indicates corrupted or invalid persisted state.
 */
export class CategoryGroupInvalidSystemPositionError extends HttpError {
  constructor(id: string) {
    super(
      `Invalid state: SYSTEM category group must have null position (id: ${id})`
    );
  }
}

/**
 * Error thrown when a category group deletion requires an inheriting category,
 * but none was provided while transactions still exist.
 */
export class InheritingCategoryRequiredError extends HttpError {
  constructor() {
    super("Inheriting category is required when transactions exist", 400);
  }
}

/**
 * Thrown when the provided inheriting category belongs to the category group being deleted
 */
export class InheritingCategoryBelongsToDeletedGroupError extends HttpError {
  constructor() {
    super(
      "Inheriting category cannot belong to the deleted category group",
      400
    );
  }
}
