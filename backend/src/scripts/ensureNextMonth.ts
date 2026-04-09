import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { ensureMonthsContinuity } from "../features/budget/category/core/application/services/months/ensureMonthsContinuity";
import { startOfMonth, addMonths } from "date-fns";

const prisma = new PrismaClient();

// call this file with ts-node
/**
 * Ensures that all categories have a month record for next month.
 * This script is idempotent and safe to run multiple times.
 */
// call with npx ts-node ensureNextMonthExists
// note: the month needs to be set to the following month in the handler
// currently not working because server is doing date now, and its not a future month
async function ensureNextMonthExists() {
  console.log("Prisma client:", prisma);
  console.log("Has $queryRaw?", typeof prisma.$queryRaw);
  await ensureMonthsContinuity(prisma, "e0058a28-d270-4471-8c3b-c3b72b46d683");
}

// Run the script
ensureNextMonthExists()
  .then(() => {
    console.log("\n✓ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Script failed:", error);
    process.exit(1);
  });
