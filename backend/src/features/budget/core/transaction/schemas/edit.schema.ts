import { z } from "zod";
import {
  dateFromIso,
  dateNotInFuture,
  decimalFromString,
  singleNonZeroAmountOptional,
  memo,
  payeeName,
} from "./primitives";

/* Edit single:
 * undefined - not provided
 * null - user is deleting the category association
 * uuid - user is associating to a different category
 */

const categoryIdEdit = z.string().uuid().nullable().optional();

/**
 * Schema for updating a single transaction with partial fields.
 * All fields are optional except that at least one field must be provided.
 * The transaction ID comes from the URL parameter, not the body.
 *
 * date has to be an iso string
 * categoryId can be null to clear the category and set to uncategorised category
 * payeeId can be null to clear the payee
 * payeeName and payeeId can't both be provided
 */

export const editSingleTransactionSchema = z
  .object({
    accountId: z.string().uuid().optional(),
    date: dateFromIso("date").optional(),
    payeeId: z.string().uuid().nullable().optional(),
    payeeName: payeeName.optional(),
    categoryId: categoryIdEdit,
    memo: memo.optional(),
    inflow: decimalFromString("inflow"),
    outflow: decimalFromString("outflow"),
    cleared: z.boolean().optional(),
    transferAccountId: z.string().uuid().nullable().optional(),
  })
  // Prevent user providing empty object
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  // Prevent date from being in the future
  .refine(dateNotInFuture, {
    message: "Date cannot be in the future",
  })
  // Prevent user providing both payeeName and payeeId
  .refine(
    (data) => {
      // extract
      //   const notBothPayeeIdAndName = (data: { payeeId?: unknown; payeeName?: unknown }) =>
      // !(data.payeeId !== undefined && data.payeeName !== undefined);
      const hasPayeeId = data.payeeId !== undefined;
      const hasPayeeName = data.payeeName !== undefined;
      return !(hasPayeeId && hasPayeeName);
    },
    {
      message: "Cannot provide both payeeId and payeeName",
    }
  )
  // Prevent providing both inflow and outflow,
  // and require any provided value to be non-zero
  .refine(singleNonZeroAmountOptional(), {
    message: "inflow/outflow cannot be zero",
  })
  // Prevent setting categoryId and transferAccountId
  .refine(
    (data) => {
      const editingTransfer = data.transferAccountId !== undefined;
      const editingCategory = data.categoryId !== undefined;

      // Allow if not editing both
      if (!editingTransfer || !editingCategory) return true;

      // transferAccountId === null (remove transfer)
      if (data.transferAccountId === null) return true;

      // transferAccountId is a UUID (create/change transfer)
      return false;
    },
    { message: "Cannot set categoryId when setting transferAccountId" }
  );

// TODO:(lewis 2026-02-08 08:36) this is only used by tests
export type EditSingleTransactionInput = z.input<
  typeof editSingleTransactionSchema
>;

// TODO:(lewis 2026-02-08 08:36) this is by editSingleTransaction controller parse
export type EditSingleTransactionPayload = z.output<
  typeof editSingleTransactionSchema
>;

// If categoryId provided must be uuid
const categoryIdBulk = z.string().uuid();

/**
 * Schema for bulk updating multiple transactions.
 * Currently supports updating categoryId, accountId
 * and memo for multiple transactions at once.
 *
 */

export const editBulkTransactionsSchema = z.object({
  userId: z.string().uuid(),
  transactionIds: z.array(z.string().uuid()).min(1),
  updates: z
    .object({
      categoryId: categoryIdBulk,
      accountId: z.string().uuid(),
      memo: memo,
    })
    .partial()
    .refine(
      (data) => {
        const definedCount = Object.values(data).filter(
          (value) => value !== undefined
        ).length;

        return definedCount === 1;
      },
      {
        message: "Exactly one field must be provided for update",
      }
    ),
});

export type EditBulkTransactionsInput = z.input<
  typeof editBulkTransactionsSchema
>;

export type EditBulkTransactionsPayload = z.output<
  typeof editBulkTransactionsSchema
>;
