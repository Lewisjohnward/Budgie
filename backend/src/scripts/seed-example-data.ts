import { faker } from "@faker-js/faker";

/**
 * Use npx tsx file.ts to run
 */

type Transaction = {
  month: string;
  memo: string;
  inflow: number;
  outflow: number;
};

faker.seed(42); // optional

function getRecentDate() {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  return faker.date.between({
    from: threeMonthsAgo,
    to: now,
  });
}

function formatMonth(date: Date) {
  return date.toISOString().slice(0, 7);
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// categories split by type
const outflowMemos = {
  groceries: ["weekly groceries", "supermarket shop", "food shop"],
  rent: ["paid rent", "monthly rent"],
  transport: ["uber ride", "train ticket", "fuel"],
  eating_out: [
    "coffee",
    "lunch out",
    "indian takeaway",
    "chinese takeaway",
    "meal for dad's bday",
  ],
  bills: ["electric bill", "internet bill"],
  subscriptions: ["spotify subscription", "netflix", "gym membership"],
};

const inflowMemos = {
  salary: ["salary", "monthly wage", "paycheck"],
  ebay: ["sold item on ebay", "ebay sale"],
};

// pick inflow or outflow
function createTransaction(): Transaction {
  const date = getRecentDate();
  const isInflow = faker.datatype.boolean({ probability: 0.2 });

  if (isInflow) {
    const category = faker.helpers.objectKey(inflowMemos);
    const memo = capitalize(faker.helpers.arrayElement(inflowMemos[category]));

    let inflow = 0;

    if (category === "salary") {
      inflow = faker.number.int({ min: 1800, max: 4000 });
    } else if (category === "ebay") {
      inflow = faker.number.float({ min: 10, max: 200, fractionDigits: 2 });
    } else {
      inflow = faker.number.float({ min: 5, max: 100, fractionDigits: 2 });
    }

    return {
      month: formatMonth(date),
      memo,
      inflow,
      outflow: 0,
    };
  }

  // outflow
  const category = faker.helpers.objectKey(outflowMemos);
  const memo = capitalize(faker.helpers.arrayElement(outflowMemos[category]));

  const outflow =
    category === "rent"
      ? faker.number.int({ min: 800, max: 2000 })
      : faker.number.float({ min: 5, max: 150, fractionDigits: 2 });

  return {
    month: formatMonth(date),
    memo,
    inflow: 0,
    outflow,
  };
}

// const transactions = Array.from({ length: 20 }, createTransaction);
// console.log(transactions);

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { authUseCase } from "../features/user/auth/auth.useCase";
import { registerSchema } from "../features/user/auth/auth.schema";
import { categoryUseCase } from "../features/budget/category/core/category.useCase";
import { UserId } from "../features/user/auth/auth.types";
import { CreateCategoryPayload } from "../features/budget/category/core/category.schema";

const prisma = new PrismaClient();

/**
 * Ensures that all categories have a month record for next month.
 * This script is idempotent and safe to run multiple times.
 */

/**
 * Creates a demo user if one does not already exist.
 *
 * Checks for an existing user with the demo email and returns it if found.
 * Otherwise, registers a new demo user using the auth use case.
 *
 * @returns The existing or newly created demo user (or auth result).
 */
const registerDemoUser = async (): Promise<string> => {
  const existing = await prisma.user.findUnique({
    where: { email: "demo@demo.com" },
  });

  if (existing) {
    console.log("Demo user already exists");
    return existing.id;
  }

  const demoUser = {
    email: "demo@demo.com",
    password: "DemoPassword123!",
  };

  const registerPayload = registerSchema.parse(demoUser);
  await authUseCase.register(registerPayload);

  const user = await prisma.user.findUnique({
    where: { email: "demo@demo.com" },
  });
  if (!user) {
    throw new Error("Unable to find registered user");
  }

  return user.id;
};

const seedCategories = async (userId: string) => {
  const categoryPayload: CreateCategoryPayload = {
    categoryGroupId: "te",
    name: "test",
    userId,
  };

  await categoryUseCase.createCategory();
};

// Utilities (Electricity, Water, Gas)
// Internet & Phone
// Insurance
// Groceries
// Transport / Fuel
// Public Transport
// 🍽️ Lifestyle
// Restaurants & Takeaway
// Coffee & Cafés
// Entertainment
// Subscriptions (Netflix, Spotify, etc.)
// Shopping
// Clothing
// 💰 Financial
// Savings
// Emergency Fund
// Investments
// Debt Repayment
// Taxes
// 🎯 Personal / irregular
// Health & Pharmacy
// Fitness / Gym
// Education
// Gifts
// Donations / Charity
// Travel

async function seedDemoData() {
  try {
    const user = await registerDemoUser();

    // TODO: replace with real seed modules
    // await seedCategories(dbUser.id)
    // await seedAccounts(dbUser.id)
    // await seedTransactions(dbUser.id)
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  }
}

seedDemoData()
  .then(() => {
    console.log("✓ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("✗ Script failed:", error);
    process.exit(1);
  });
