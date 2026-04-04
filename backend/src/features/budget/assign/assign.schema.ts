import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

export const getMonthsForCategoriesSchema = z.object({
  userId: z.string().uuid(),
  categoryIds: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val])),
});
export type GetMonthsForCategoriesPayload = z.infer<
  typeof getMonthsForCategoriesSchema
>;

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
      }
    )
    .transform((str) => new Decimal(str)),
  monthId: z.string().uuid(),
});

export type AssignPayload = z.infer<typeof assignSchema>;

const assignmentsArray = z.array(
  z.object({
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
        }
      )
      .transform((str) => new Decimal(str)),
    monthId: z.string().uuid(),
  })
);

export const assignmentsSchema = z.object({
  userId: z.string().uuid(),
  assignmentsArray,
});

export type AssignmentsPayload = z.infer<typeof assignmentsSchema>;
