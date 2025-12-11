-- DropForeignKey
ALTER TABLE "Month" DROP CONSTRAINT "Month_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "Month" ADD CONSTRAINT "Month_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
