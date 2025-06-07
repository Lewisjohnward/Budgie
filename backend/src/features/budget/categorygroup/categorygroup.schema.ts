import { z } from "zod";

export const CategoryGroupSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
});

export type CategoryGroupPayload = z.infer<typeof CategoryGroupSchema>;