import { z } from "zod";

export const transactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  date: z
    .string()
    .refine((value) => !isNaN(new Date(value).getTime()), {
      message: "Invalid date format",
    })
    .optional(),
  inflow: z.number().optional(),
  outflow: z.number().optional(),
  payee: z.string().max(100).optional(),
  memo: z.string().max(100).optional(),
});
