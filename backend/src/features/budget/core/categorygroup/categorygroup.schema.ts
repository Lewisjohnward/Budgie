import { z } from "zod";

export const createCategoryGroupSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
});

// TODO: IS THIS CORRECT IF JUST EDITING POSITION?
export const editCategoryGroupSchema = z.object({
  userId: z.string().uuid(),
  categoryGroupId: z.string().uuid(),
  name: z.string().min(1),
});

export const deleteCategoryGroupSchema = z.object({
  userId: z.string().uuid(),
  categoryGroupId: z.string().uuid(),
  inheritingCategoryId: z.string().uuid().optional(),
});

export type CreateCategoryGroupPayload = z.infer<
  typeof createCategoryGroupSchema
>;

export type CreateCategoryGroupData = CreateCategoryGroupPayload & {
  position: number;
};

export type EditCategoryGroupPayload = z.infer<typeof editCategoryGroupSchema>;
export type EditCategoryGroupData = EditCategoryGroupPayload;

export type DeleteCategoryGroupPayload = z.infer<
  typeof deleteCategoryGroupSchema
>;
