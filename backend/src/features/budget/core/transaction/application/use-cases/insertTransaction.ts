import { prisma } from "../../../../../../shared/prisma/client";
import { accountService } from "../../../account/account.service";
import {
  asCategoryId,
  type CategoryId,
} from "../../../category/core/category.types";
import { transactionService } from "../../transaction.service";
import { type CreateTransactionPayload } from "../../transaction.schema";
import { type AccountId, asAccountId } from "../../../account/account.types";
import { asPayeeId, type PayeeId } from "../../../payee/payee.types";
import { asUserId, type UserId } from "../../../../../user/auth/auth.types";
import { type CreateTransactionResult } from "../../contracts/createTransaction.contract";

/**
 * Base structure for a transaction create command after transforming raw input.
 *
 * Contains the strongly-typed `userId`, `accountId`, optional `categoryId` and `payeeId`,
 * and a required `date`. All other fields from the input payload are preserved except
 * `accountId`, `transferAccountId`, `categoryId`, `payeeId`, and `date`, which are re-mapped.
 */
type BaseInsertTransactionCommand = Omit<
  CreateTransactionPayload,
  "accountId" | "transferAccountId" | "categoryId" | "payeeId" | "date"
> & {
  userId: UserId;
  accountId: AccountId;
  categoryId?: CategoryId;
  payeeId?: PayeeId;
  date: Date;
  origin: "USER" | "SYSTEM";
};

/**
 * Represents the internal command for creating a transaction, distinguishing between
 * normal transactions and transfers.
 *
 * - `type: "normal"` – a standard transaction for a single account.
 * - `type: "transfer"` – a transaction representing a transfer between two accounts.
 *
 * The `transferAccountId` is required for transfers and omitted for normal transactions.
 */
export type CreateTransactionCommand =
  | (BaseInsertTransactionCommand & {
      type: "transfer";
      transferAccountId: AccountId;
    })
  | (BaseInsertTransactionCommand & {
      type: "normal";
      transferAccountId?: undefined;
    });

/**
 * Converts a raw transaction payload into a strongly-typed
 * `InsertTransactionCommand` for internal service usage.
 *
 * This includes:
 * - Converting `userId`, `accountId`, `transferAccountId`, `categoryId`, and `payeeId` to branded types.
 * - Filling default values such as `date` if not provided.
 * - Adding the `type` field (`"normal"` or `"transfer"`) based on presence of `transferAccountId`.
 *
 * @param p - The raw transaction payload from the client, including a string `userId`.
 * @returns A strongly-typed `InsertTransactionCommand` suitable for internal services.
 */
export const toCreateTransactionCommand = (
  p: CreateTransactionPayload & { userId: string }
): CreateTransactionCommand => {
  const base = {
    userId: asUserId(p.userId),
    accountId: asAccountId(p.accountId),
    categoryId: p.categoryId ? asCategoryId(p.categoryId) : undefined,
    payeeId: p.payeeId ? asPayeeId(p.payeeId) : undefined,
    date: p.date ?? new Date(),
    memo: p.memo,
    inflow: p.inflow,
    outflow: p.outflow,
    payeeName: p.payeeName,
    origin: "USER" as const,
  };

  if (p.transferAccountId) {
    return {
      ...base,
      type: "transfer",
      transferAccountId: asAccountId(p.transferAccountId),
    };
  } else {
    return {
      ...base,
      type: "normal",
      transferAccountId: undefined,
    };
  }
};

/**
 * Creates a transaction and applies its associated domain changes atomically.
 *
 * Validates ownership of the source account, determines whether the command
 * represents a normal transaction or a transfer, and delegates creation to
 * the appropriate transaction service.
 *
 * Collects the resulting domain changes, including created transactions,
 * optional payee, memos, and budget months, as well as updated accounts and
 * budget months. The returned domain result is intended to be mapped to an
 * API response by the transaction DTO mapper.
 *
 * @param payload - Validated transaction payload, including the user ID.
 *
 * @returns The created transactions and associated domain changes, including
 * newly created entities and updated accounts or budget months.
 *
 * @throws If account ownership validation, transaction creation, or an
 * associated domain operation fails.
 *
 * @example
 * await createTransaction({
 *   userId: "user-123",
 *   accountId: "acc-456",
 *   outflow: "10.00",
 *   memo: "Groceries",
 *   categoryId: "cat-789",
 * });
 */
export const createTransaction = async (
  payload: CreateTransactionPayload & { userId: string }
): Promise<CreateTransactionResult> => {
  const command = toCreateTransactionCommand(payload);

  return prisma.$transaction(async (tx) => {
    // Validate ownership of the source account.
    await accountService.getAccount(tx, command.accountId, command.userId);

    if (command.type === "transfer") {
      const result = await transactionService.createTransferTransaction(
        tx,
        command
      );

      return {
        createdTransactions: {
          type: "transfer",
          source: result.sourceTransaction,
          destination: result.destinationTransaction,
        },
        createdPayee: undefined,
        createdMemos: result.createdMemos,
        createdMonths: result.createdMonths,
        updatedAccounts: result.updatedAccounts,
        updatedMonths: [],
      };
    }

    const result = await transactionService.createNormalTransaction(
      tx,
      command
    );

    return {
      createdTransactions: {
        type: "normal",
        transaction: result.transaction,
      },
      createdPayee: result.payee,
      createdMemos: result.memos ?? [],
      createdMonths: result.createdMonths,
      updatedAccounts: [result.account],
      updatedMonths: result.updatedMonths ?? [],
    };
  });
};
