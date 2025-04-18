import { PrismaClient } from "@prisma/client";
import {
  createAccount,
  insertTransaction,
  updateReadyToAssignMonths,
} from "..";
import { AccountPayload } from "../../../dto";

const prisma = new PrismaClient();

export const initialiseAccount = async (account: AccountPayload) => {
  const createdAccount = await createAccount(account);

  // TODO: THE NAME needs to be protected

  // const defaultCategory = await prisma.category.findFirstOrThrow({
  //   where: {
  //     name: "Inflow: Ready to Assign",
  //   },
  // });

  const readyToAssignCategory = await prisma.category.findFirstOrThrow({
    where: {
      userId: account.userId,
      name: "Ready to Assign",
    },
  });

  await insertTransaction(account.userId, {
    accountId: createdAccount.id,
    inflow: account.balance,
    categoryId: readyToAssignCategory.id,
  });

  if (account.balance > 0) {
    updateReadyToAssignMonths(
      readyToAssignCategory.id,
      account.balance,
      account.userId,
    );
  }
};
