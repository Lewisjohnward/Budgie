import { AccountType, CategoryType } from "@prisma/client";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Seed Users
  const user = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      password: "$2b$10$YCf12F5kDDFVsofWhJzxhu2qwDNGbi0hnDZjatcA6ZBjKRMY6GG7y",
      salt: "$2b$10$YCf12F5kDDFVsofWhJzxhu",
    },
  });

  const budget = await prisma.budget.create({
    data: {
      userId: user.id,
      name: "Starting budget",
    },
  });

  const category = await prisma.category.create({
    data: {
      name: "Rent",
      type: CategoryType.EXPENSE, // Choose from CategoryType (EXPENSE/INCOME)
      budgetId: budget.id, // Link category to the budget
    },
  });

  const account = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Main bank account",
      type: AccountType.BANK,
    },
  });

  const transaction = await prisma.transaction.create({
    data: {
      accountId: account.id, // Link transaction to the account
      categoryId: category.id, // Link transaction to the category
      budgetId: budget.id, // Link transaction to the budget
      amount: 50, // Transaction amount
      payee: "Supermart", // Payee
      memo: "Grocery shopping", // Memo
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
