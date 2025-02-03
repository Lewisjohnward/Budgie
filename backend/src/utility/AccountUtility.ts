import { PrismaClient } from "@prisma/client";
import { accountSchema, UpdatedTransaction } from "../schemas";
import { AccountPayload, TransactionPayload } from "../dto";
import { Decimal } from "@prisma/client/runtime/library";

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

function convertDecimalToNumber(value: Decimal | null | undefined): number {
  return value ? value.toNumber() : 0;
}

export const selectAccounts = async (userId: string) => {
  const accountsWithTransactions = await prisma.account.findMany({
    where: {
      userId,
    },
    include: {
      transactions: {
        include: {
          subCategory: true,
        },
      },
    },
  });

  const accounts = accountsWithTransactions.map((account) => ({
    ...account,
    balance: convertDecimalToNumber(account.balance),
    transactions: account.transactions.map((transaction) => ({
      ...transaction,
      inflow: convertDecimalToNumber(transaction.inflow),
      outflow: convertDecimalToNumber(transaction.outflow),
    })),
  }));

  return accounts;
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
  const defaultSubCategory = await prisma.subCategory.findFirstOrThrow({
    where: {
      name: "Inflow: Ready to Assign",
    },
  });

  await insertTransaction({
    accountId: createdAccount.id,
    subCategoryId: defaultSubCategory.id,
    inflow: account.balance,
  });
};

export const insertTransaction = async (transaction: TransactionPayload) => {
  if (transaction.subCategoryId === undefined) {
    const defaultSubCategory = await prisma.subCategory.findFirstOrThrow({
      where: {
        name: "This needs a category",
      },
    });

    const newTransaction = {
      ...transaction,
      subCategoryId: defaultSubCategory.id,
    };

    await prisma.transaction.create({
      data: newTransaction,
    });
  } else {
    // TODO: should I check that categoryId exists in the db before adding it, probably
    const { subCategoryId, ...rest } = transaction;

    if (!subCategoryId) {
      throw new Error("No categoryId provided");
    }

    const newTransaction = { subCategoryId, ...rest };

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

export const deleteTransactions = async (
  userId: string,
  transactionIds: string[],
) => {
  const deletedTransactions = await prisma.transaction.deleteMany({
    where: {
      id: {
        in: transactionIds,
      },
      account: {
        userId: userId,
      },
    },
  });

  return deletedTransactions;
};

export const updateTransactions = async (
  userId: string,
  updatedTransaction: UpdatedTransaction,
) => {
  const { id: id, ...fields } = updatedTransaction;

  await prisma.transaction.update({
    where: {
      id: id,
      account: {
        userId,
      },
    },
    data: {
      ...fields,
    },
  });
};
