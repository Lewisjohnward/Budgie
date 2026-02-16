-- CreateEnum
CREATE TYPE "TransactionOrigin" AS ENUM ('USER', 'SYSTEM');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "deletable" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "origin" "TransactionOrigin" DEFAULT 'USER';
