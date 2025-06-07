import { Decimal } from "@prisma/client/runtime/library";
import { z } from "zod";

const commonTransactionSchema = z.object({
  categoryId: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .refine((val) => val === null || z.string().uuid().safeParse(val).success)
    .nullish()
    .optional(),
  inflow: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      try {
        return new Decimal(val);
      } catch {
        throw new Error(`Invalid outflow value: ${val}`);
      }
    }),
  outflow: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      try {
        return new Decimal(val);
      } catch {
        throw new Error(`Invalid outflow value: ${val}`);
      }
    }),
  payeeId: z.string().uuid().nullish().optional(),
  memo: z.string().max(100).nullish(),
});

type CommonTransaction = z.infer<typeof commonTransactionSchema>;

const inflowOutflowValidation = (data: CommonTransaction) => {
  const inflowValid = data.inflow && !data.inflow.isZero();
  const outflowValid = data.outflow && !data.outflow.isZero();
  return (inflowValid && !outflowValid) || (!inflowValid && outflowValid);
};

const atLeastOneField = (data: CommonTransaction) =>
  Object.values(data).some((value) => value !== undefined && value !== null);

export const transactionSchema = commonTransactionSchema
  .extend({
    accountId: z.string().uuid(),
    date: z
      .string()
      .refine((value) => !isNaN(new Date(value).getTime()), {
        message: "Invalid date format",
      })
      .optional(),
  })
  .refine(inflowOutflowValidation, {
    message: "Exactly an inflow or outflow must be provided, but not both",
  });

export type TransactionPayload = z.infer<typeof transactionSchema>;

export type TransactionsToUpdate = z.infer<typeof editTransactionArraySchema>;

export const duplicateTransactionsSchema = z.object({
  transactionIds: z.array(z.string().uuid()),
});

export type DuplicateTransactionsPayload = z.infer<
  typeof duplicateTransactionsSchema
>;

export const editTransactionSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
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

export const editTransactionArraySchema = z.array(editTransactionSchema);
