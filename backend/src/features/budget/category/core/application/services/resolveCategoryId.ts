import { Prisma } from "@prisma/client";
import { categoryService } from "../../category.service";
import { type UserId } from "../../../../../user/auth/auth.types";
import { type CategoryId } from "../../category.types";

/**
 * Resolves the category ID to use for a transaction
 *
 * If a categoryId is provided, validates that the user owns it.
 * If no categoryId is provided, returns the uncategorised category ID.
 *
 * @param tx - The Prisma transaction client
 * @param userId - The ID of the user
 * @param categoryId - Optional ID of a category to use
 * @returns The resolved category ID (either provided or uncategorised)
 * @throws {CategoryNotFoundError} - If the provided categoryId doesn't exist or doesn't belong to the user
 */

export const resolveCategoryId = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  categoryId?: CategoryId
): Promise<string> => {
  if (categoryId) {
    // await getCategory(tx, userId, categoryId);
    return categoryId;
  }

  return await categoryService.categories.getUncategorisedCategoryId(
    tx,
    userId
  );
};

// TODO:(lewis 2025-12-19 10:05) resolveCategoryId
///// WIP
///// WIP
///// WIP
///// WIP
///// WIP
///// WIP
///// WIP

// Benefits
// Consistency: Mirrors
// resolvePayeeId
//  pattern
// Single responsibility: One function handles category resolution logic
// Cleaner use-case: Removes the conditional and separate uncategorised lookup
// Reusability: Other use-cases (e.g., updateTransaction) can use the same logic
// Fewer lines: Reduces clutter in
// insertTransaction
// Difference from payee
// Payee: payeeId OR payeeName (create new) OR null
// Category: categoryId (validate) OR fallback to uncategorisedCategoryId (always returns a value)
// This is simpler than payee resolution since you're not creating categories on the fly.
//
// Should you do it?
// ✅ Yes, for the same reasons you extracted
// resolvePayeeId
// :
//
// Cleaner use-case code
// Encapsulates category resolution logic
// Easier to test in isolation
// Consistent pattern across domains
// Would you like me to implement this refactor?
//
// Feedback submitted
//
//
// @insertTransaction.ts#L59 @insertTransaction.ts#L69 what about these bits?
//
// Those bits are different concerns and should stay separate:
//
// getRtaCategoryId (line 59)
// Purpose: Fetch a special system category ID (Ready to Assign)
// When: Always needed in this use-case to determine transaction type
// Not part of resolution logic: This isn't about resolving which category to use for the transaction; it's about identifying a special category for conditional logic
// isRtaTransaction check (line 69)
// Purpose: Branch logic based on transaction type (RTA vs normal category)
// Why separate: Different processing paths:
// RTA transactions → update RTA activity
// Normal transactions → recalculate category months
// Business logic: Belongs in the use-case orchestration, not in a service
// Should they be combined with resolveCategoryId?
// No, because:
//
// Different responsibilities:
// resolveCategoryId: "Which category should this transaction use?"
// getRtaCategoryId: "What is the system RTA category ID?"
// isRtaTransaction: "Does this transaction need special RTA processing?"
// getRtaCategoryId is used for comparison, not assignment:
// You're not assigning the RTA category to the transaction
// You're checking if the resolved category happens to be RTA
// Separation of concerns:
// Resolution logic (service): determine the category
// Orchestration logic (use-case): fetch RTA ID, compare, branch
