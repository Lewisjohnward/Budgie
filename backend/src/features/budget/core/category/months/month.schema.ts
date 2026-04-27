import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

/**
 * Schema for fetching months for one or more categories.
 */
export const getMonthsForCategoriesSchema = z.object({
  userId: z.string().uuid(),
  categoryIds: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val])),
});

export type GetMonthsForCategoriesPayload = z.infer<
  typeof getMonthsForCategoriesSchema
>;

/**
 * Schema for validating month assignment payloads.
 * Converts numeric input values into Decimal for internal precision-safe handling.
 */
export const assignmentsSchema = z.object({
  userId: z.string().uuid(),
  assignments: z.array(
    z.object({
      assigned: z
        .number()
        .nonnegative()
        .transform((n) => new Decimal(n)),
      monthId: z.string().uuid(),
    })
  ),
});

export type AssignmentsPayload = z.infer<typeof assignmentsSchema>;
