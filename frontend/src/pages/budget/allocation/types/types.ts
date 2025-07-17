import { z } from "zod";

export const AddCategorySchema = z.object({
  categoryGroupId: z.string(),
  name: z.string().min(1),
});

export type AddCategoryFormData = z.infer<typeof AddCategorySchema>;
