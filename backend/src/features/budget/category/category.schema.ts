import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Category name cannot be empty" }),
  categoryGroupId: z.string().uuid({ message: "Invalid Category Group ID" }),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, { message: "Category name cannot be empty" }).optional(),
});

export const categoryParamsSchema = z.object({
  categoryId: z.string().uuid({ message: "Invalid Category ID format" }),
});

export const CategorySchema = z.object({
  userId: z.string().uuid(),
  categoryGroupId: z.string().uuid(),
  name: z.string().max(50, { message: "Name must be less than 50 characters" }),
});

export const DeleteCategorySchema = z.object({
  userId: z.string().uuid(),
  categoryToDeleteId: z.string().uuid(),
  inheritingCategoryId: z.string().uuid().optional(),
});

export const EditCategorySchema = CategorySchema.extend({});

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>;
export type CategoryPayload = z.infer<typeof CategorySchema>;
export type DeleteCategoryPayload = z.infer<typeof DeleteCategorySchema>;