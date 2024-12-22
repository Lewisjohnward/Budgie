/*
  Warnings:

  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_budgetId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_budgetId_fkey";

-- DropTable
DROP TABLE "Budget";
