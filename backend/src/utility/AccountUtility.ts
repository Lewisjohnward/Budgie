import { PrismaClient } from "@prisma/client";
import { accountSchema } from "../schemas";
import { AccountPayload, TransactionPayload } from "../dto";

const prisma = new PrismaClient();

export const isValidAccount = async (accountId: string) => {
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
    },
  });

  if (account === null) {
    // TODO: NEEDS TESTING
    throw new Error("Invalid account");
  }

  return account;
};

export const userOwnsAccount = async (accountId: string, userId: string) => {
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
      userId: userId,
    },
  });

  if (!account) {
    throw new Error("Unable to add transaction");
  }
};

export const selectAccounts = async (userId: string) => {
  const accountsWithTransactions = await prisma.account.findMany({
    where: {
      userId,
    },
    include: {
      transactions: true,
    },
  });

  return accountsWithTransactions;
};

export const validateAccount = ({
  userId,
  name,
  type,
  balance,
}: {
  userId: string;
  name: string;
  type: string;
  balance: number;
}) => {
  return accountSchema.parse({ userId, name, type, balance });
};

export const createAccount = async (account: AccountPayload) => {
  return await prisma.account.create({
    data: {
      ...account,
    },
  });
};

export const initialiseAccount = async (account: AccountPayload) => {
  const createdAccount = await createAccount(account);

  // TODO: THE NAME needs to be protected
  const defaultCategory = await prisma.category.findFirstOrThrow({
    where: {
      name: "Inflow: Ready to Assign",
    },
  });

  await insertTransaction({
    accountId: createdAccount.id,
    categoryId: defaultCategory.id,
    inflow: account.balance,
  })

};

export const insertTransaction = async (transaction: TransactionPayload) => {
  if (transaction.categoryId === undefined) {
    const defaultCategory = await prisma.category.findFirstOrThrow({
      where: {
        name: "This needs a category",
      },
    });

    const newTransaction = {
      ...transaction,
      categoryId: defaultCategory.id,
    };

    await prisma.transaction.create({
      data: newTransaction,
    });
  } else {
    const { categoryId, ...rest } = transaction;

    if (!categoryId) {
      throw new Error("No categoryId provided");
    }

    const newTransaction = { categoryId, ...rest };

  const insertedTransaction = await prisma.transaction.create({
      data: newTransaction,
    });
  }
};

export const initialiseCategories = async (userId: string) => {
  await prisma.category.createMany({
    data: [
      { userId, name: "Inflow: ready to assign" },
      { userId, name: "This needs a category" },
    ],
  });
};
