import { z } from "zod";

/**
 * Schema for creating a new category.
 *
 * Requires:
 * - A valid user ID
 * - A non-empty category name
 * - A valid category group ID
 */
export const createCategorySchema = z.object({
  userId: z.string().uuid(),
  name: z.string().trim().min(1, { message: "Category name cannot be empty" }),
  categoryGroupId: z.string().uuid({ message: "Invalid Category Group ID" }),
});

/**
 * Payload used when creating a category.
 */
export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;

/**
 * Internal data required to persist a category.
 * Extends the create payload with a computed position field.
 */
export type CreateCategoryData = CreateCategoryPayload & { position: number };

/**
 * Schema for editing an existing category.
 *
 * Supports partial category updates:
 * - Renaming a category
 * - Moving a category to a different category group
 *
 * Requires:
 * - `userId` to validate ownership and permissions
 * - `categoryId` to identify the category being updated
 *
 * Validation rules:
 * - At least one editable field must be provided
 *   (`name` or `categoryGroupId`)
 * - `name`, when provided:
 *   - is trimmed
 *   - cannot be empty
 *   - must be 50 characters or fewer
 * - `categoryGroupId`, when provided, must be a valid UUID
 */
export const editCategorySchema = z.object({
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  position: z.number().optional(),
  categoryGroupId: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: "Name cannot be empty" })
    .max(50, {
      message: "Name must be less than 50 characters",
    })
    .optional(),
});
// TODO:(lewis 2026-05-18 15:15) prevent sending pos/ catgroup id and name at same time
// .refine(
//   ({ name, categoryGroupId }) =>
//     name !== undefined || categoryGroupId !== undefined,
//   {
//     message: "Either name or categoryGroupId must be provided",
//     path: ["name"],
//   }
// );

/**
 * Payload used when editing a category.
 */
export type EditCategoryPayload = z.infer<typeof editCategorySchema>;

/**
 * Schema for deleting a category.
 *
 * If `inheritingCategoryId` is provided, transactions or data
 * from the deleted category are reassigned to it.
 */
export const deleteCategorySchema = z.object({
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  inheritingCategoryId: z.string().uuid().optional(),
});

/**
 * Payload used when deleting a category.
 */
export type DeleteCategoryPayload = z.infer<typeof deleteCategorySchema>;
