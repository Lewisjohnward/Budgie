import { faker } from "@faker-js/faker";
import { Transaction } from "@/core/types/NormalizedData";

// Seed for deterministic tests
faker.seed(123);

type TransactionOverrides = Partial<Transaction>;

export const createTransaction = (
  overrides: TransactionOverrides = {}
): Transaction => {
  const isInflow = faker.datatype.boolean({ probability: 0.3 });
  const date = faker.date.recent({ days: 90 });
  // Use existing category IDs that match the mock data (cat1 or cat2)
  const categoryId = faker.helpers.arrayElement(["cat1", "cat2"]);
  // Map categoryId to the correct category string format
  const categoryMap = {
    cat1: "Food: Groceries",
    cat2: "Inflow: Salary",
  };

  return {
    id: faker.string.uuid(),
    accountId: "acc1",
    categoryId,
    date,
    inflow: isInflow ? faker.number.int({ min: 100, max: 5000 }) : 0,
    outflow: !isInflow ? faker.number.int({ min: 10, max: 500 }) : 0,
    payee: faker.company.name(),
    memo: faker.lorem.words({ min: 1, max: 5 }),
    cleared: faker.datatype.boolean(),
    createdAt: date,
    updatedAt: date,
    category: categoryMap[categoryId as keyof typeof categoryMap],
    ...overrides,
  };
};

export const createManyTransactions = (count: number): Transaction[] => {
  return Array.from({ length: count }, (_, i) =>
    createTransaction({
      memo: `tx-${i + 1}`,
    })
  );
};
