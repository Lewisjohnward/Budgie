import { type Decimal } from "@prisma/client/runtime/library";
import { type UserId } from "../../../../../user/auth/auth.types";
import { type AccountId } from "../../../account/account.types";
import { type Prisma } from "@prisma/client";
import { categoryService } from "../../../category/core/category.service";
import { OperationMode } from "../../../../../../shared/enums/operation-mode";
import { accountService } from "../../../account/account.service";
import { ZERO } from "../../../../../../shared/constants/zero";
import { type PayeeId } from "../../../payee/payee.types";
import { transactionService } from "../../transaction.service";
import { type DomainNormalTransaction } from "../../transaction.types";
import { type DomainMonth } from "../../../category/core/category.types";

type CreateSystemTransactionResult = {
  createdTransaction: DomainNormalTransaction;
  updatedMonths: DomainMonth[];
};

type SystemTransactionOptions = {
  userId: UserId;
  accountId: AccountId;
  amount: Decimal;
  memo?: string;
  payeeId: PayeeId;
};

/**
 * Creates a system-generated transaction for a user's account.
 *
 * System transactions are automatically assigned to the user's Ready to Assign
 * (RTA) category and processed through the normal transaction workflow.
 *
 * Behaviour:
 * - Retrieves the user's RTA category.
 * - Determines the transaction inflow or outflow based on the amount's sign.
 * - Inserts the transaction with an origin of "SYSTEM".
 * - Updates the RTA category's monthly activity.
 * - Recalculates the available amounts for affected RTA months.
 * - Updates the associated account balance.
 *
 * Domain invariants:
 * - All system transactions belong to the user's RTA category.
 * - The transaction must reference an account owned by the specified user.
 * - All database operations and related side effects execute within the
 *   provided Prisma transaction to ensure atomicity.
 *
 * @param tx - The Prisma transaction client used for all database operations.
 * @param options - The options used to construct the system transaction.
 * @param options.userId - ID of the user who owns the account.
 * @param options.accountId - ID of the account associated with the transaction.
 * @param options.amount - Transaction amount. Positive values represent inflows,
 *   negative values represent outflows, and zero represents neither.
 * @param options.memo - Optional transaction memo or description.
 * @param options.payeeId - ID of the payee associated with the transaction.
 *
 * @returns The created transaction and the updated RTA months.
 */
export const createSystemTransaction = async (
  tx: Prisma.TransactionClient,
  { userId, accountId, amount, memo, payeeId }: SystemTransactionOptions
): Promise<CreateSystemTransactionResult> => {
  const date = new Date();

  const categoryId = await categoryService.rta.getRtaCategoryId(tx, userId);

  const createdTransaction = await transactionService.insertNormalTransaction(
    tx,
    {
      accountId,
      date,
      inflow: amount.gt(0) ? amount.abs() : ZERO,
      outflow: amount.lt(0) ? amount.abs() : ZERO,
      categoryId,
      memo,
      origin: "SYSTEM",
      payeeId,
    }
  );

  await categoryService.rta.updateMonthsActivityForTransactions(
    tx,
    userId,
    categoryId,
    [createdTransaction],
    OperationMode.Add
  );

  const updatedRtaMonths = await categoryService.rta.calculateMonthsAvailable(
    tx,
    userId,
    categoryId
  );

  await accountService.updateAccountBalances(
    tx,
    [createdTransaction],
    OperationMode.Add
  );

  return {
    createdTransaction,
    updatedMonths: updatedRtaMonths,
  };
};
