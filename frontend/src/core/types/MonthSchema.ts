import { z } from "zod";

export const MonthSchema = z.object({
  assigned: z.string(),
  monthId: z.string().uuid(),
  assignId: z.string().uuid(),
});

export type Month = z.infer<typeof MonthSchema>;
