import { z } from "zod";

/**
 * Schema for validating the payload to duplicate one or more transactions.
 * Requires a user ID and a non-empty array of transaction IDs.
 */
export const duplicateTransactionsSchema = z.object({
  userId: z.string().uuid(),
  transactionIds: z
    .array(z.string().uuid())
    .min(1, "At least one transaction is required"),
});

/**
 * Represents the type of the payload for duplicating transactions, inferred from the schema.
 */
export type DuplicateTransactionsPayload = z.infer<
  typeof duplicateTransactionsSchema
>;

/**
 * Schema for validating the payload to delete one or more transactions.
 * Requires a user ID and a non-empty array of transaction IDs.
 */
export const deleteTransactionsSchema = z.object({
  userId: z.string().uuid(),
  transactionIds: z
    .array(z.string().uuid())
    .min(1, "At least one transaction is required"),
});

/**
 * Represents the type of the payload for deleting transactions, inferred from the schema.
 */
export type DeleteTransactionsPayload = z.infer<
  typeof deleteTransactionsSchema
>;
