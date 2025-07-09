import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

export const assignSchema = z.object({
  userId: z.string().uuid(),
  assigned: z.string().transform((str) => {
    const num = new Decimal(str);
    if (num.isNaN() || num.isNegative()) {
      return new Decimal(0);
    }
    return num;
  }),
  monthId: z.string().uuid(),
});

export type AssignPayload = z.infer<typeof assignSchema>;
