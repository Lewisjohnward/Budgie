-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_categoryGroupId_fkey";

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_categoryGroupId_fkey" FOREIGN KEY ("categoryGroupId") REFERENCES "CategoryGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
