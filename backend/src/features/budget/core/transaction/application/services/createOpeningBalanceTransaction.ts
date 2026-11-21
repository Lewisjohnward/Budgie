import { type Prisma } from "@prisma/client";
import { type Decimal } from "@prisma/client/runtime/library";
import { type UserId } from "../../../../../user/auth/auth.types";
import { type AccountId } from "../../../account/account.types";
import { payeeService } from "../../../payee/payee.service";
import { createSystemTransaction } from "./createSystemTransaction";
import { type DomainMonth } from "../../../category/core/category.types";
import { type DomainNormalTransaction } from "../../transaction.types";

type CreateOpeningBalanceTransactionResult = {
  createdTransaction: DomainNormalTransaction;
  updatedMonths: DomainMonth[];
};

/**
 * Creates a system transaction representing an account's opening balance.
 *
 * Retrieves the user's Starting Balance payee and creates a system transaction
 * associated with the specified account. The transaction uses the provided
 * balance as its amount and is recorded with the memo "Starting Balance".
 *
 * Also updates the affected budget months and returns them alongside the
 * created transaction.
 *
 * @param tx - The Prisma transaction client used to execute the operation.
 * @param userId - The ID of the user who owns the account.
 * @param accountId - The ID of the account being initialised.
 * @param balance - The opening balance to record.
 * @returns The created opening balance transaction and the updated budget months.
 */
export const createOpeningBalanceTransaction = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  accountId: AccountId,
  balance: Decimal
): Promise<CreateOpeningBalanceTransactionResult> => {
  const startingBalancePayeeId = await payeeService.getStartingBalancePayeeId(
    tx,
    userId
  );

  const { createdTransaction, updatedMonths } = await createSystemTransaction(
    tx,
    {
      userId,
      accountId,
      amount: balance,
      memo: "Starting Balance",
      payeeId: startingBalancePayeeId,
    }
  );
  return { createdTransaction, updatedMonths };
};
