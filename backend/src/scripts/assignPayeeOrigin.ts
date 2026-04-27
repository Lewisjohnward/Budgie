import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PayeeOrigin } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates system-defined payees for a specific user.
 *
 * This script:
 * - Looks up a user by a fixed email address ("temp@gmail.com")
 * - Throws an error if the user does not exist
 * - Creates two system payees for that user:
 *   - "Manual Balance Adjustment"
 *   - "Starting Balance"
 * - Uses `skipDuplicates` to avoid inserting duplicates if they already exist
 *
 * These payees are marked with `PayeeOrigin.SYSTEM`.
 *
 * @async
 * @function assignPayeeOrigin
 * @throws Error If no user is found with the specified email
 * @returns Promise<void> Resolves when payees are successfully created or already exist
 */
async function assignPayeeOrigin() {
  const user = await prisma.user.findFirst({
    where: { email: "temp@gmail.com" },
  });

  if (!user) {
    throw new Error("unable to find user");
  }

  const id = user.id;

  const manualBalanceAdjustmentPayee = {
    userId: id,
    name: "Manual Balance Adjustment",
    origin: PayeeOrigin.SYSTEM,
  };

  const startingBalancePayee = {
    userId: id,
    name: "Starting Balance",
    origin: PayeeOrigin.SYSTEM,
  };

  await prisma.payee.createMany({
    data: [manualBalanceAdjustmentPayee, startingBalancePayee],
    skipDuplicates: true,
  });
}

// Run the script
assignPayeeOrigin()
  .then(() => {
    console.log("\n✓ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Script failed:", error);
    process.exit(1);
  });
