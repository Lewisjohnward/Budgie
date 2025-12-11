import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

///// Legacy - to be replaced by editSingleTransactionSchema and editBulkTransactionsSchema
export const editTransactionSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().nullable(),
  payeeId: z
    .string()
    .uuid()
    .nullable()
    .transform((val) => val ?? null)
    .default(null),
  memo: z
    .string()
    .max(100)
    .nullable()
    .transform((val) => val ?? null)
    .default(null),
  transferTransactionId: z.string().uuid().nullable().default(null),
  transferAccountId: z.string().uuid().nullable().default(null),
  date: z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Invalid date",
    })
    .transform((val) => new Date(val)),

  inflow: z.string().transform((val) => new Decimal(val)),

  outflow: z.string().transform((val) => new Decimal(val)),

  cleared: z.boolean().default(false),

  createdAt: z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Invalid createdAt date",
    })
    .transform((val) => new Date(val)),

  updatedAt: z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Invalid updatedAt date",
    })
    .transform((val) => new Date(val)),
});

export const editTransactionArraySchema = z.object({
  userId: z.string().uuid(),
  transactions: z
    .array(editTransactionSchema)
    .min(1, "At least one transaction is required"),
});
//////////

export type EditTransactionsPayload = z.infer<
  typeof editTransactionArraySchema
>;

export * from "./schemas/primitives";
export * from "./schemas/create.schema";
export * from "./schemas/edit.schema";
export * from "./schemas/commands.schema";
