/*
  Warnings:

  - You are about to drop the column `budgetId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `budgetId` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "budgetId";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "budgetId";
