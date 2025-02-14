import { z } from "zod";

const commonTransactionSchema = z.object({
  categoryId: z.string().uuid().optional(),
  date: z
    .string()
    .refine((value) => !isNaN(new Date(value).getTime()), {
      message: "Invalid date format",
    })
    .optional(),
  inflow: z.number().optional(),
  outflow: z.number().optional(),
  payee: z.string().max(100).nullish(),
  memo: z.string().max(100).nullish(),
});

type CommonTransaction = z.infer<typeof commonTransactionSchema>;

const inflowOutflowValidation = (data: CommonTransaction) =>
  (data.inflow && !data.outflow) || (!data.inflow && data.outflow);

const atLeastOneField = (data: CommonTransaction) =>
  Object.values(data).some((value) => value !== undefined && value !== null);

export const transactionSchema = commonTransactionSchema
  .extend({
    accountId: z.string().uuid(),
  })
  .refine(inflowOutflowValidation, {
    message: "Exactly an inflow or outflow must be provided, but not both",
  })
  .refine(inflowOutflowValidation);

export const editTransactionSchema = commonTransactionSchema
  .extend({
    id: z.string().uuid("Invalid tranactionId"),
    accountId: z.string().uuid().optional(),
  })
  .refine(atLeastOneField, {
    message: "At least one field must be provided",
  })
  .refine(inflowOutflowValidation);

export const editTransactionArraySchema = z.array(editTransactionSchema);

export type UpdatedTransaction = z.infer<typeof editTransactionSchema>;
