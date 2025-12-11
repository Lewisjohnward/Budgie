/*
  Warnings:

  - Made the column `open` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "open" SET NOT NULL;
