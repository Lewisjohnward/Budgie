import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillAccountPayees() {
  console.log("Starting backfill of AccountPayees...");

  // Get all accounts that don't have an AccountPayee yet
  const accounts = await prisma.account.findMany({
    where: {
      accountPayee: null,
    },
    select: {
      id: true,
      userId: true,
      name: true,
    },
  });

  console.log(`Found ${accounts.length} accounts without AccountPayees`);

  // Create AccountPayee for each account
  for (const account of accounts) {
    await prisma.accountPayee.create({
      data: {
        userId: account.userId,
        accountId: account.id,
      },
    });
    console.log(`✓ Created AccountPayee for account: ${account.name}`);
  }

  console.log("Backfill complete!");
}

backfillAccountPayees()
  .catch((error) => {
    console.error("Error during backfill:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// npx ts-node file/path.ts
