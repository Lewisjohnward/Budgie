import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

module.exports = async () => {
  process.env.DATABASE_URL =
    "postgresql://user:password@localhost:5433/app_test";

  const schemaPath = path.resolve(__dirname, "../../prisma/schema.prisma");
  execSync(
    `npx prisma db push --force-reset --accept-data-loss --schema=${schemaPath}`,
  );

  await prisma.$disconnect();
};
