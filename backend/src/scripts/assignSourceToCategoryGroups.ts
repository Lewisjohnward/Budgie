import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PayeeOrigin } from "@prisma/client";

const prisma = new PrismaClient();

async function assignSourceToCategoryGroups() {
  const user = await prisma.user.findFirst({
    where: { email: "lewis@gmail.com" },
  });

  if (!user) {
    throw new Error("unable to find user");
  }

  const categoryGroups = await prisma.categoryGroup.findMany({});
  console.log("categoryGroups:", categoryGroups);

  // const id = user.id;
  //
  // const manualBalanceAdjustmentPayee = {
  //   userId: id,
  //   name: "Manual Balance Adjustment",
  //   origin: PayeeOrigin.SYSTEM,
  // };
  //
  // const startingBalancePayee = {
  //   userId: id,
  //   name: "Starting Balance",
  //   origin: PayeeOrigin.SYSTEM,
  // };
  //
  // await prisma.payee.createMany({
  //   data: [manualBalanceAdjustmentPayee, startingBalancePayee],
  //   skipDuplicates: true,
  // });
}

// Run the script
assignSourceToCategoryGroups()
  .then(() => {
    console.log("\n✓ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n✗ Script failed:", error);
    process.exit(1);
  });
