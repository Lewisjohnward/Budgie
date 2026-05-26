import { z } from "zod";
import { CategoryGroupId } from "./categoryGroup.types";

export const createCategoryGroupSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
});

export const updateCategoryGroupSchema = z
  .object({
    userId: z.string().uuid(),
    categoryGroupId: z.string().uuid(),
    name: z.string().min(1).optional(),
    position: z.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const hasName = data.name !== undefined;
    const hasPosition = data.position !== undefined;

    if (!hasName && !hasPosition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either name or position must be provided",
      });
    }

    if (hasName && hasPosition) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cannot update name and position in the same request",
      });
    }
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

export type UpdateCategoryGroupPayload = z.infer<
  typeof updateCategoryGroupSchema
>;

export type RenameCategoryGroupData = {
  categoryGroupId: CategoryGroupId;
  name: string;
};

export type RepositionCategoryGroupData = {
  categoryGroupId: CategoryGroupId;
  position: number;
};

export type DeleteCategoryGroupPayload = z.infer<
  typeof deleteCategoryGroupSchema
>;
