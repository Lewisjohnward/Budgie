/*
  Warnings:

  - A unique constraint covering the columns `[transferTransactionId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "transferTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transferTransactionId_key" ON "Transaction"("transferTransactionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transferTransactionId_fkey" FOREIGN KEY ("transferTransactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
