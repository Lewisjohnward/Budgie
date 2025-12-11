/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Payee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Payee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payee" ADD COLUMN     "automaticallyCategorisePayee" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "defaultCategoryId" TEXT,
ADD COLUMN     "includeInPayeeList" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payee_userId_name_key" ON "Payee"("userId", "name");

-- AddForeignKey
ALTER TABLE "Payee" ADD CONSTRAINT "Payee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
