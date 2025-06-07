import { prisma } from "../../../../shared/prisma/client";
import { transactionService } from "../../transaction/transaction.service";
import { AccountPayload } from "../account.schema";

export const initialiseAccount = async (account: AccountPayload) => {
  const createdAccount = await prisma.account.create({
    data: {
      ...account,
      balance: 0,
    },
  });

  if (account.balance.gt(0)) {
    const readyToAssignCategory = await prisma.category.findFirstOrThrow({
      where: {
        userId: account.userId,
        name: "Ready to Assign",
      },
    });

    await transactionService.insertTransaction(account.userId, {
      accountId: createdAccount.id,
      inflow: account.balance,
      categoryId: readyToAssignCategory.id,
    });
  }

  return createdAccount;
};
