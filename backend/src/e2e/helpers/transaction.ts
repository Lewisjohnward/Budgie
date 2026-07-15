import { type Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { type AccountId } from "../../features/budget/core/account/account.types";
import { type CategoryId } from "../../features/budget/core/category/core/category.types";
import { transactionService } from "../../features/budget/core/transaction/transaction.service";
import { type UserId } from "../../features/user/auth/auth.types";

type CreateNormalTransactionOptions = {
  accountId: AccountId;
  categoryId: CategoryId;
  date: Date;
} & (
  | {
      inflow: number;
      outflow?: never;
    }
  | {
      outflow: number;
      inflow?: never;
    }
);

export async function createNormalTransaction(
  tx: Prisma.TransactionClient,
  userId: UserId,
  options: CreateNormalTransactionOptions
): Promise<void> {
  const inflow =
    options.inflow !== undefined ? new Decimal(options.inflow) : undefined;

  const outflow =
    options.outflow !== undefined ? new Decimal(options.outflow) : undefined;

  await transactionService.createNormalTransaction(tx, {
    userId,
    type: "normal",
    accountId: options.accountId,
    categoryId: options.categoryId,
    date: options.date,
    origin: "USER",
    inflow,
    outflow,
  });
}
