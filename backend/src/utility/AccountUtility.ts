import { PrismaClient } from "@prisma/client";
import { accountSchema, UpdatedTransaction } from "../schemas";
import { AccountPayload, TransactionPayload } from "../dto";
import { Decimal } from "@prisma/client/runtime/library";
import { CategoryPayload } from "../schemas/CategorySchema";

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
    orderBy: {
      position: "asc",
    },
    include: {
      transactions: {
        include: {
          category: true,
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

export const selectCategories = async (userId: string) => {
  const categoryGroups = await prisma.categoryGroup.findMany({
    where: {
      userId,
    },
    include: {
      categories: {
        include: {
          months: true,
        },
      },
    },
  });

  const categories = categoryGroups.map((group) => ({
    ...group,
    categories: group.categories.map((category) => ({
      ...category,
      assigned: convertDecimalToNumber(category.assigned),
      activity: convertDecimalToNumber(category.activity),
      months: category.months.map((month) => ({
        ...month,
        activity: convertDecimalToNumber(month.activity),
      })),
    })),
  }));

  return categories;
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
      balance: 0,
    },
  });
};

export const initialiseAccount = async (account: AccountPayload) => {
  const createdAccount = await createAccount(account);

  // TODO: THE NAME needs to be protected
  // const defaultCategory = await prisma.category.findFirstOrThrow({
  //   where: {
  //     name: "Inflow: Ready to Assign",
  //   },
  // });

  await insertTransaction({
    accountId: createdAccount.id,
    inflow: account.balance,
  });
};

//TODO: THIS NEEDS FIXING
export const insertTransaction = async (transaction: TransactionPayload) => {
  // TODO: check that if a categoryId is given it exists to prevent bug

  const account = await prisma.account.findUniqueOrThrow({
    where: {
      id: transaction.accountId,
    },
  });

  const { inflow, outflow } = transaction;

  const balanceModifier = 0 - (outflow ? outflow : 0) + (inflow ? inflow : 0);

  const updatedBalance =
    convertDecimalToNumber(account.balance) + balanceModifier;

  await prisma.$transaction(async (tx) => {
    await prisma.transaction.create({
      data: transaction,
    });
    await prisma.account.update({
      where: { id: account.id },
      data: { ...account, balance: updatedBalance },
    });
  });
};

const roundToStartOfMonth = (date: Date) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  return startOfMonth;
};

export const initialiseCategories = async (userId: string) => {
  const inflow = await prisma.categoryGroup.create({
    data: {
      userId,
      name: "Inflow",
    },
  });

  await prisma.category.create({
    data: {
      userId,
      categoryGroupId: inflow.id,
      name: "Ready to Assign",
    },
  });

  // TODO: EXTRACT INTO OWN FUNCTION
  const today = new Date();
  const startOfCurrentMonth = roundToStartOfMonth(today);
  const nextMonth = new Date(
    startOfCurrentMonth.getFullYear(),
    startOfCurrentMonth.getMonth() + 1,
    1,
    1,
  );

  const billsCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: userId,
      name: "Bills",
    },
  });

  const otherCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: userId,
      name: "Other",
    },
  });

  const forgotToBudgetCategory = await prisma.category.create({
    data: {
      userId: userId,
      categoryGroupId: otherCategoryGroup.id,
      name: "❗️ Stuff I forgot to budget for",
    },
  });

  const forgotToBudgetMonth = await prisma.month.create({
    data: {
      categoryId: forgotToBudgetCategory.id,
      month: startOfCurrentMonth,
      activity: 0,
    },
  });

  const forgotToBudgetMonthNext = await prisma.month.create({
    data: {
      categoryId: forgotToBudgetCategory.id,
      month: nextMonth,
      activity: 0,
    },
  });

  const housingCategory = await prisma.category.create({
    data: {
      userId: userId,
      categoryGroupId: billsCategoryGroup.id,
      name: "🏠 Rent/Mortgage",
    },
  });

  const utilitiesCategory = await prisma.category.create({
    data: {
      userId: userId,
      categoryGroupId: billsCategoryGroup.id,
      name: "🔌 Utilities",
    },
  });

  const housingMonths = await prisma.month.create({
    data: {
      categoryId: housingCategory.id,
      month: startOfCurrentMonth,
      activity: 45,
    },
  });

  const housingMonthsNext = await prisma.month.create({
    data: {
      categoryId: housingCategory.id,
      month: nextMonth,
    },
  });

  const utilitiesMonths = await prisma.month.create({
    data: {
      categoryId: utilitiesCategory.id,
      month: startOfCurrentMonth,
      activity: 69,
    },
  });

  const utilitiesMonthsNext = await prisma.month.create({
    data: {
      categoryId: utilitiesCategory.id,
      month: nextMonth,
    },
  });

  // const bills = await prisma.category.createMany({
  //   data: [
  //     {
  //       userId: userId,
  //       categoryGroupId: BillsCategoryGroup.id,
  //       name: "Rent/Mortgage",
  //     },
  //     {
  //       userId: userId,
  //       categoryGroupId: BillsCategoryGroup.id,
  //       name: "Gas and Electricity",
  //     },
  //     {
  //       userId: userId,
  //       categoryGroupId: BillsCategoryGroup.id,
  //       name: "Broadband",
  //     },
  //     {
  //       userId: userId,
  //       categoryGroupId: BillsCategoryGroup.id,
  //       name: "Water",
  //     },
  //   ],
  // });
  //
  // const NeedsCategoryGroup = await prisma.categoryGroup.create({
  //   data: {
  //     userId: userId,
  //     name: "Needs",
  //   },
  // });
  //
  // const groceriesCategoryGroup = await prisma.category.create({
  //   data: {
  //     categoryGroupId: NeedsCategoryGroup.id,
  //     userId: userId,
  //     name: "Groceries",
  //     assigned: 0,
  //     activity: 0,
  //   },
  // });
  //
  // const WantsCategoryGroup = await prisma.categoryGroup.create({
  //   data: {
  //     userId: userId,
  //     name: "Wants",
  //   },
  // });

  // const needsCategory = await prisma.categoryGroup.create({
  //   data: {
  //     userId,
  //     name: "",
  //   },
  // });

  //   {
  //   userId,
  //   categoryGroupId: needsCategory.id,
  //   name: "This needs a category",
  // },
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

export const createCategory = async (category: CategoryPayload) => {
  await prisma.category.create({
    data: category,
  });
};
