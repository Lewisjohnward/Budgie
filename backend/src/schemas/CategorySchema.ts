import { z } from "zod";

// export const CategorySchema = z.object({
//   userId: z.string().uuid(),
//   name: z.string().max(20, { message: "Name must be less than 20 characters" }),
// });

export const CategorySchema = z.object({
  userId: z.string().uuid(),
  categoryGroupId: z.string().uuid(),
  name: z.string().max(20, { message: "Name must be less than 20 characters" }),
});

export type CategoryPayload = z.infer<typeof CategorySchema>;

// TODO: NEED TO DO
export const EditCategorySchema = CategorySchema.extend({});
