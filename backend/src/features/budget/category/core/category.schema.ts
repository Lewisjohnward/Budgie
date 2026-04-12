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
  name: z.string().min(1, { message: "Category name cannot be empty" }),
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
 * Supports partial updates:
 * - Change category name
 * - Move category to a different group
 * - (Potentially) update position indirectly via group changes
 *
 * Requires:
 * - userId for ownership validation
 * - categoryId to identify the category being edited
 */
export const editCategorySchema = z.object({
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  categoryGroupId: z.string().uuid().optional(),
  name: z
    .string()
    .min(1)
    .max(50, { message: "Name must be less than 50 characters" })
    .optional(),
});

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
