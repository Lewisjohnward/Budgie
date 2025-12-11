/*
  Warnings:

  - Added the required column `position` to the `CategoryGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CategoryGroup" ADD COLUMN     "position" INTEGER NOT NULL;
