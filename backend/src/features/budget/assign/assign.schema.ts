import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

export const assignSchema = z.object({
  userId: z.string().uuid(),
  assigned: z
    .string()
    .refine(
      (str) => {
        try {
          const num = new Decimal(str);
          return !num.isNaN() && !num.isNegative();
        } catch {
          return false;
        }
      },
      {
        message: "assigned must be a valid non-negative number string",
      },
    )
    .transform((str) => new Decimal(str)),
  monthId: z.string().uuid(),
});

export type AssignPayload = z.infer<typeof assignSchema>;
