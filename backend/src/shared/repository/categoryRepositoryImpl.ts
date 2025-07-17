import { Month, Prisma } from "@prisma/client";
import { PROTECTED_CATEGORY_NAMES } from "../../features/budget/category/category.constants";
import { CategoryRepository } from "../../features/budget/category/category.repository";

export const categoryRepository: CategoryRepository = {
  // ──────────────── Category Retrieval ────────────────
  getCategory: async (tx, userId, categoryId) => {
    return await tx.category.findUnique({ where: { id: categoryId, userId } });
  },

  getCategoryIdByGroupAndName: async (tx, userId, categoryGroupId, name) => {
    const categoryId = await tx.category.findFirst({
      where: { categoryGroupId, userId, name },
      select: { id: true },
    });
    return categoryId?.id ?? null;
  },

  getAllCategoryIds: async (tx, userId) => {
    return await tx.category.findMany({
      where: { userId },
      select: { id: true },
    });
  },

  getProtectedCategoryIds: async (tx, userId) => {
    const protectedCategories = await tx.category.findMany({
      where: { userId, name: { in: [...PROTECTED_CATEGORY_NAMES] } },
    });
    return protectedCategories.map((c) => c.id);
  },

  getRtaCategoryId: async (tx, userId) => {
    const { id } = await tx.category.findFirstOrThrow({
      where: { name: "Ready to Assign", userId },
      select: { id: true },
    });
    return id;
  },

  getUncategorisedCategoryId: async (tx, userId) => {
    const { id } = await tx.category.findFirstOrThrow({
      where: { name: "Uncategorised Transactions", userId },
      select: { id: true },
    });
    return id;
  },

  getMaxCategoryPositionInGroup: async (tx, categoryGroupId) => {
    const latest = await tx.category.findFirst({
      where: { categoryGroupId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    return latest?.position ?? null;
  },

  // ──────────────── Category Mutation ────────────────
  createCategory: async (tx, category) => {
    return await tx.category.create({ data: category });
  },

  updateCategory: async (tx, categoryId, name, categoryGroupId) => {
    const data: Prisma.CategoryUpdateInput = {};
    if (name !== undefined) data.name = name;
    if (categoryGroupId !== undefined) {
      data.categoryGroup = { connect: { id: categoryGroupId } };
    }
    await tx.category.update({ where: { id: categoryId }, data });
  },

  deleteCategory: async (tx, categoryId) => {
    await tx.category.delete({ where: { id: categoryId } });
  },

  // ──────────────── Month Retrieval ────────────────
  getExistingMonths: async (tx, userId) => {
    return await tx.month.findMany({
      where: { category: { userId } },
      select: { month: true },
    });
  },

  getPastMonths: async (tx, userId) => {
    return await tx.month.findMany({
      where: {
        category: { userId },
        month: { lte: new Date() },
      },
      select: { month: true },
    });
  },

  getAllMonthsForCategories: async (tx, userId, rtaCategoryId) => {
    return await tx.month.findMany({
      where: {
        category: { userId },
        categoryId: { not: rtaCategoryId },
      },
      orderBy: { month: "asc" },
    });
  },

  getAllRtaMonths: async (tx, userId, rtaCategoryId) => {
    return await tx.month.findMany({
      where: {
        categoryId: rtaCategoryId,
        category: { userId },
      },
      orderBy: { month: "asc" },
    });
  },

  getMonthsForCategoriesStartingFrom: async (tx, categoryIds, month) => {
    return await tx.month.findMany({
      where: {
        categoryId: { in: categoryIds },
        month: { gte: month },
      },
      orderBy: { month: "asc" },
    });
  },

  getMonth: async function(
    tx: Prisma.TransactionClient,
    userId: string,
    monthId: string,
  ): Promise<Month> {
    return await tx.month.findUniqueOrThrow({
      where: {
        id: monthId,
        category: {
          userId,
        },
      },
    });
  },

  // ──────────────── Month Mutation ────────────────
  createMonths: async (tx, months) => {
    await tx.month.createMany({ data: months, skipDuplicates: true });
  },

  deleteMonthsByCategoryId: async (tx, categoryId) => {
    await tx.month.deleteMany({ where: { categoryId } });
  },

  updateMonths: async (tx, updatedCategoryMonths) => {
    await Promise.all(
      updatedCategoryMonths.map((m) =>
        tx.month.update({
          where: { id: m.id },
          data: {
            activity: m.activity,
            available: m.available,
            assigned: m.assigned,
          },
        }),
      ),
    );
  },
};
