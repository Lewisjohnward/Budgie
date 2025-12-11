/*
  Warnings:

  - You are about to drop the column `accountPayeeId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `AccountPayee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountPayee" DROP CONSTRAINT "AccountPayee_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountPayee" DROP CONSTRAINT "AccountPayee_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_accountPayeeId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "accountPayeeId";

-- DropTable
DROP TABLE "AccountPayee";
