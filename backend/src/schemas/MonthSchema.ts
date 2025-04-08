import { z } from "zod";

export const MonthSchema = z.object({
  assigned: z.string().transform((str) => {
    const num = Number(str);
    if (isNaN(num)) {
      return 0;
    }
    return num;
  }),
  monthId: z.string().uuid(),
  assignId: z.string().uuid(),
});

export type UpdateMonthPayload = z.infer<typeof MonthSchema>;
