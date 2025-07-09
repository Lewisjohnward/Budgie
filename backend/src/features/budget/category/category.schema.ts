import { z } from "zod";

export const createCategorySchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1, { message: "Category name cannot be empty" }),
  categoryGroupId: z.string().uuid({ message: "Invalid Category Group ID" }),
});

export const editCategorySchema = z.object({
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  categoryGroupId: z.string().uuid(),
  name: z
    .string()
    .min(1)
    .max(50, { message: "Name must be less than 50 characters" }),
});

export const deleteCategorySchema = z.object({
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  inheritingCategoryId: z.string().uuid().optional(),
});

export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
export type CreateCategoryData = CreateCategoryPayload & { position: number };

export type EditCategoryPayload = z.infer<typeof editCategorySchema>;
export type DeleteCategoryPayload = z.infer<typeof deleteCategorySchema>;
