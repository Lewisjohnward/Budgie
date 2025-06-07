import { z } from "zod";

export const AssignSchema = z.object({
  assigned: z.string().transform((str) => {
    const num = Number(str);
    if (isNaN(num)) {
      return 0;
    }
    if (num < 0) {
      return 0;
    }
    return num;
  }),
  monthId: z.string().uuid(),
});

export type UpdateMonthPayload = z.infer<typeof AssignSchema>;
