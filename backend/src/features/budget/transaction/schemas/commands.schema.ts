import { z } from "zod";

export const duplicateTransactionsSchema = z.object({
  userId: z.string().uuid(),
  transactionIds: z
    .array(z.string().uuid())
    .min(1, "At least one transaction is required"),
});

export type DuplicateTransactionsPayload = z.infer<
  typeof duplicateTransactionsSchema
>;

export const deleteTransactionSchema = z.object({
  userId: z.string().uuid(),
  transactionIds: z
    .array(z.string().uuid())
    .min(1, "At least one transaction is required"),
});

export type DeleteTransactionPayload = z.infer<typeof deleteTransactionSchema>;
