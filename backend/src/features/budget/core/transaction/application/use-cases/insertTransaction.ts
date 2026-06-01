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
 * Orchestrates creation of a new transaction for a user.
 *
 * @responsibilities
 * - Executes the operation inside a database transaction.
 * - Validates that the source account is owned by the user.
 * - Determines whether the transaction is a transfer or a normal transaction.
 * - Delegates all creation and side-effects to the appropriate transaction service.
 *
 * @notes
 * - Schema-level validation is assumed to have already occurred.
 * - Transfer transactions are fully handled by `insertTransferTransaction`.
 * - Normal transactions (including category resolution, month updates, and balance recalculation) are fully handled by `insertNormalTransaction`.
 *
 * @param userId - ID of the user creating the transaction.
 * @param transaction - Validated transaction input data.
 *
 * @returns A promise that resolves when the transaction has been successfully inserted.
 *
 * @throws {Error} If the user does not own the source account.
 * @throws {SameAccountTransferError} If a transfer targets the same account.
 *
 * @example
 * await insertTransaction('user-123', {
 *   accountId: 'acc-456',
 *   outflow: 1000,
 *   memo: 'Groceries',
 *   categoryId: 'cat-789',
 * });
 */

// type AddTransactionResponse = {
//   transactions: Record<string, TransactionDto>;
//   accounts: Record<string, AccountDto>;
//   months: Record<string, MonthDto>;
// };

// get new months ( insert missing months )
// get new memos ( insert missing memos )

export const createTransaction = async (
  payload: CreateTransactionPayload & { userId: string }
): Promise<CreateTransactionResult> => {
  const command = toCreateTransactionCommand(payload);

  return await prisma.$transaction(async (tx) => {
    // validate ownership
    await accountService.getAccount(tx, command.accountId, command.userId);

    if (command.type === "transfer") {
      const result = await transactionService.createTransferTransaction(
        tx,
        command
      );

      return {
        created: {
          transactions: result.transactions,
          memos: result.memos?.length > 0 ? result.memos : undefined,
        },
        updated: {
          accounts: Object.fromEntries(result.accounts.map((a) => [a.id, a])),
        },
      };
    }

    const result = await transactionService.createNormalTransaction(
      tx,
      command
    );

    return {
      created: {
        transactions: [result.transaction],
        payees: result.payee ? [result.payee] : undefined,
        memos: result.memos?.length > 0 ? result.memos : undefined,
      },
      updated: {
        accounts: {
          [result.account.id]: result.account,
        },
        months: result.months?.length
          ? Object.fromEntries(result.months.map((m) => [m.id, m]))
          : undefined,
      },
    };
  });
};
