import { AccountType, PrismaClient } from "@prisma/client";

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

  const BillsCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: user.id,
      name: "Bills",
    },
  });

  const bills = await prisma.category.createMany({
    data: [
      {
        userId: user.id,
        categoryGroupId: BillsCategoryGroup.id,
        name: "Gas and Electricity",
      },
      {
        userId: user.id,
        categoryGroupId: BillsCategoryGroup.id,
        name: "Rent",
      },
      {
        userId: user.id,
        categoryGroupId: BillsCategoryGroup.id,
        name: "Broadband",
      },
      {
        userId: user.id,
        categoryGroupId: BillsCategoryGroup.id,
        name: "Water",
      },
      {
        userId: user.id,
        categoryGroupId: BillsCategoryGroup.id,
        name: "Gym",
      },
    ],
  });

  const NeedsCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: user.id,
      name: "Needs",
    },
  });

  const WantsCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: user.id,
      name: "Wants",
    },
  });

  const SubscriptionsCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: user.id,
      name: "Subscriptions",
    },
  });

  const subscriptions = await prisma.category.createMany({
    data: [
      {
        userId: user.id,
        categoryGroupId: SubscriptionsCategoryGroup.id,
        name: "HiNative",
      },
      {
        userId: user.id,
        categoryGroupId: SubscriptionsCategoryGroup.id,
        name: "Gym",
      },
    ],
  });

  const groceriesCategoryGroup = await prisma.category.create({
    data: {
      categoryGroupId: NeedsCategoryGroup.id,
      userId: user.id,
      name: "Groceries",
      assigned: 0,
      activity: 0,
    },
  });
  const account = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Test account",
      type: AccountType.BANK,
    },
  });

  await prisma.transaction.create({
    data: {
      //       categoryId: category.id, // Link transaction to the category
      accountId: account.id, // Link transaction to the account
      categoryId: groceriesCategoryGroup.id,
      // budgetId: budget.id, // Link transaction to the budget
      outflow: 12.5, // Transaction amount
      payee: "Supermart", // Payee
      memo: "Chicken thighs, mince", // Memo
    },
  });

  await prisma.transaction.create({
    data: {
      //       categoryId: category.id, // Link transaction to the category
      accountId: account.id, // Link transaction to the account
      // budgetId: budget.id, // Link transaction to the budget
      outflow: 3.69, // Transaction amount
      memo: "HiNavite", // Memo
    },
  });

  // const billsCategory = await prisma.category.create({
  //   data: {
  //     userId: user.id,
  //     name: "Bills",
  //   },
  // });
  //
  // const unAssignedCategory = await prisma.category.create({
  //   data: {
  //     userId: user.id,
  //     name: "Unassigned",
  //   },
  // });

  // const budget = await prisma.budget.create({
  //   data: {
  //     userId: user.id,
  //     name: "Starting budget",
  //   },
  // });
  // const inflowSubCategory = await prisma.subCategory.create({
  //   data: {
  //     name: "Inflow: Ready to Assign",
  //     userId: user.id,
  //     categoryId: unAssignedCategory.id,
  //     assigned: 0,
  //     activity: 0,
  //     // type: CategoryType.EXPENSE, // Choose from CategoryType (EXPENSE/INCOME)
  //     // budgetId: budget.id, // Link category to the budget
  //   },
  // });
  //
  // const category = await prisma.subCategory.create({
  //   data: {
  //     name: "This needs a category",
  //     userId: user.id,
  //     categoryId: unAssignedCategory.id,
  //     assigned: 0,
  //     activity: 0,
  //     // type: CategoryType.EXPENSE, // Choose from CategoryType (EXPENSE/INCOME)
  //     // budgetId: budget.id, // Link category to the budget
  //   },
  // });

  // const account = await prisma.account.create({
  //   data: {
  //     userId: user.id,
  //     name: "Main bank account",
  //     type: AccountType.BANK,
  //   },
  // });
  //
  // const transaction = await prisma.transaction.createMany({
  //   data: [
  //     {
  //       accountId: account.id, // Link transaction to the account
  //       categoryId: category.id, // Link transaction to the category
  //       // budgetId: budget.id, // Link transaction to the budget
  //       outflow: 12.5, // Transaction amount
  //       payee: "Supermart", // Payee
  //       memo: "Chicken thighs, mince", // Memo
  //     },
  //     {
  //       accountId: account.id, // Link transaction to the account
  //       categoryId: category.id, // Link transaction to the category
  //       // budgetId: budget.id, // Link transaction to the budget
  //       outflow: 0.8, // Transaction amount
  //       payee: "M&S", // Payee
  //       memo: "Sparkling water", // Memo
  //     },
  //   ],
  // });
}

const createAccount = async () => {
  // const user = await prisma.user.create({
  //   data: {
  //     email: "john.doe@example.com",
  //     password: "$2b$10$YCf12F5kDDFVsofWhJzxhu2qwDNGbi0hnDZjatcA6ZBjKRMY6GG7y",
  //     salt: "$2b$10$YCf12F5kDDFVsofWhJzxhu",
  //   },
  // });
  //
  // const account = await prisma.account.create({
  //   data: {
  //     userId: user.id,
  //     name: "Test account",
  //     type: AccountType.BANK,
  //     balance: 10,
  //   },
  // });
  //
  // const inflowCategoryGroup = await prisma.categoryGroup.create({
  //   data: {
  //     //       categoryId: category.id, // Link transaction to the category
  //     userId: user.id, // Link transaction to the account
  //     // budgetId: budget.id, // Link transaction to the budget
  //     name: "Inflow",
  //   },
  // });
  //
  // const readyToAssignCategory = await prisma.category.create({
  //   data: {
  //     //       categoryId: category.id, // Link transaction to the category
  //     userId: user.id, // Link transaction to the account
  //     categoryGroupId: inflowCategoryGroup.id,
  //     // budgetId: budget.id, // Link transaction to the budget
  //     name: "Inflow",
  //     assigned: 10.0,
  //   },
  // });
  //
  // await prisma.transaction.create({
  //   data: {
  //     //       categoryId: category.id, // Link transaction to the category
  //     accountId: account.id, // Link transaction to the account
  //     // budgetId: budget.id, // Link transaction to the budget
  //     inflow: 10.0, // Transaction amount
  //     payee: "From mum", // Payee
  //     categoryId: readyToAssignCategory.id,
  //   },
  // });
};

createAccount()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
