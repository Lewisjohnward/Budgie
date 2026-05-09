import { z } from "zod";

export const MonthSchema = z.object({
  assigned: z.string(),
});

export type Month = z.infer<typeof MonthSchema>;
