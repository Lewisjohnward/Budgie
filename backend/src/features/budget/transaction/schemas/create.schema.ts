import { z } from "zod";
import {
  categoryIdCreate,
  dateFromIso,
  dateNotInFuture,
  decimalFromString,
  memo,
  payeeName,
  singleNonZeroAmountRequired,
} from "./primitives";

// Base transaction schema
export const transactionBaseSchema = z.object({
  accountId: z.string().uuid(),
  date: dateFromIso("date").optional(),
  transferAccountId: z.string().uuid().optional(),
  payeeId: z.string().uuid().optional(),
  payeeName: payeeName.optional(),
  categoryId: categoryIdCreate.optional(),
  memo: memo.optional(),
  inflow: decimalFromString("inflow"),
  outflow: decimalFromString("outflow"),
});

export const transactionSchema = transactionBaseSchema
  // Prevent date from being in the future
  .refine(dateNotInFuture, { message: "Date cannot be in the future" })
  // Prevent providing both inflow and outflow, and require any provided value to be non-zero
  .refine(singleNonZeroAmountRequired(), {
    message: "inflow/outflow cannot be zero",
  })
  // Prevent user providing a payeeName and a payeeId
  .refine(
    (data) => {
      const hasPayeeId = data.payeeId !== undefined;
      const hasPayeeName = data.payeeName !== undefined;
      return !(hasPayeeId && hasPayeeName);
    },
    {
      message: "Cannot provide both payeeId and payeeName",
    }
  )
  // Prevent user providing transferAccountId and payeeName or payeeId - transfers can't have payees
  .refine(
    (data) => {
      if (data.transferAccountId) {
        return !data.payeeId && !data.payeeName;
      }
      return true;
    },
    {
      message: "Cannot specify payee for account transfers",
    }
  )
  // Prevent user providing transferAccountId and categoryId - transfers can't be assigned to a category
  .refine(
    (data) => {
      if (data.transferAccountId) {
        return !data.categoryId;
      }
      return true;
    },
    {
      message: "Cannot specify category for account transfers",
    }
  );

// Input type - for API/external input (strings before transformation)
export type TransactionPayload = z.input<typeof transactionSchema>;

// Output type - for internal use (Decimals after transformation)
export type TransactionData = z.output<typeof transactionSchema>;

// Internal schema used only by services/repo
export const transferTransactionCreateSchema = transactionBaseSchema.extend({
  transferTransactionId: z.string().uuid().optional(),
});

export type TransferTransactionData = z.output<
  typeof transferTransactionCreateSchema
>;

export type TransferSourceCreateData = Omit<TransferTransactionData, "date"> & {
  date: Date;
  transferTransactionId?: undefined;
};

export type TransferDestinationCreateData = Omit<
  TransferTransactionData,
  "date"
> & {
  date: Date;
  transferTransactionId: string;
};
