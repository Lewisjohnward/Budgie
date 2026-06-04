import { type DomainCategory, type DomainMonth } from "../category.types";

/**
 * Domain result of the category creation use case.
 *
 * Represents the full set of state changes produced when creating a category
 * within a single transactional operation.
 *
 * This includes:
 * - The newly created category
 * - Any months that were created or initialized as a result of the category creation
 *
 * This object acts as a consistency boundary output:
 * - It is the single source of truth for all side effects of the operation
 * - It can be mapped into a DTO for client synchronization
 * - It ensures UI state can be updated deterministically after creation
 */
export type CreateCategoryResult = {
  createdCategory: DomainCategory;

  createdMonths: DomainMonth[];
};
