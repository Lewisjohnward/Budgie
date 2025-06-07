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

import { toZonedTime } from "date-fns-tz";
import { isAfterUtc as isFutureDate } from "../utils/isAfterUtc";
import { TransactionPayload } from "../transaction.schema";
import { Transaction } from "@prisma/client";

export function validateTransaction(
  transaction: TransactionPayload | Transaction,
) {
  // check that transaction is not in the future
  const transactionDate = new Date(transaction.date ?? Date.now());
  const utcNow = toZonedTime(new Date(), "UTC");

  if (isFutureDate(transactionDate, utcNow)) {
    throw new Error("transaction is in the future, rejected");
  }
}
