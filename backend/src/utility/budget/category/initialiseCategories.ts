import { PrismaClient } from "@prisma/client";
import { createCategory } from "..";

const prisma = new PrismaClient();

export const initialiseCategories = async (userId: string) => {
  const inflow = await prisma.categoryGroup.create({
    data: {
      userId,
      name: "Inflow",
    },
  });

  const uncategorisedGroup = await prisma.categoryGroup.create({
    data: {
      userId,
      name: "Uncategorised",
    },
  });

  const billsCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: userId,
      name: "Bills",
    },
  });

  const otherCategoryGroup = await prisma.categoryGroup.create({
    data: {
      userId: userId,
      name: "Other",
    },
  });

  createCategory({
    userId,
    categoryGroupId: uncategorisedGroup.id,
    name: "Uncategorised Transactions",
  });

  createCategory({
    userId,
    categoryGroupId: inflow.id,
    name: "Ready to Assign",
  });
  createCategory({
    userId,
    categoryGroupId: billsCategoryGroup.id,
    name: "🏠 Rent/Mortgage",
  });
  createCategory({
    userId,
    categoryGroupId: billsCategoryGroup.id,
    name: "🔌 Utilities",
  });
  createCategory({
    userId,
    categoryGroupId: otherCategoryGroup.id,
    name: "❗️ Stuff I forgot to budget for",
  });
};
