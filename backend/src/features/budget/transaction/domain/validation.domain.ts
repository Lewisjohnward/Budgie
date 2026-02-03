/**
 * Validates a transaction to ensure its date is not set in the future.
 *
 * - Converts the transaction date to a Date object.
 * - Compares against the current UTC time.
 * - Throws an error if the transaction date is after the current UTC time.
 *
 * @param transaction - The transaction payload or database transaction object to validate.
 * @throws Error if the transaction date is in the future.
 */

import { isAfterUtc as isFutureDate } from "../utils/isAfterUtc";
import { AddTransactionPayload } from "../transaction.schema";
import { FutureDateError } from "../transaction.errors";

type TransactionDateOnly = Pick<AddTransactionPayload, "date">;

export function validateTransaction(transaction: TransactionDateOnly) {
  // check that transaction is not in the future
  const transactionDate = new Date(transaction.date ?? Date.now());
  const utcNow = new Date();

  if (isFutureDate(transactionDate, utcNow)) {
    throw new FutureDateError();
  }
}
