import { Prisma } from "@prisma/client";
import { PROTECTED_CATEGORY_NAMES } from "../../features/budget/category/category.constants";
import { CategoryRepository } from "../../features/budget/category/category.repository";
import {
  type db,
  type MonthId,
} from "../../features/budget/category/category.types";
import { NoPastMonthsFoundError } from "../../features/budget/category/category.errors";
import { type UserId } from "../../features/user/auth/auth.types";

export const categoryRepository: CategoryRepository = {
  // ──────────────── Category Retrieval ────────────────
  getCategory: async (tx, userId, categoryId) => {
    const row = await tx.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!row) return null;

    return row;
  },

  getUserCategoryIds: async (tx, userId, categoryIds) => {
    const row = await tx.category.findMany({
      where: {
        id: { in: categoryIds },
        userId,
      },
      select: { id: true },
    });

    return row.map((r) => r.id);
  },

  existsCategoryWithNameInGroup: async (tx, userId, categoryGroupId, name) => {
    const row = await tx.category.findFirst({
      where: { userId, categoryGroupId, name },
      select: { id: true },
    });
    return !!row;
  },

  getAllCategoryIds: async (tx, userId) => {
    const rows = await tx.category.findMany({
      where: { userId },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  },

  getProtectedCategoryIds: async (tx, userId) => {
    const protectedCategories = await tx.category.findMany({
      where: { userId, name: { in: [...PROTECTED_CATEGORY_NAMES] } },
      select: {
        id: true,
      },
    });
    return protectedCategories.map((c) => c.id);
  },

  getRtaCategoryId: async (tx, userId) => {
    const row = await tx.category.findFirst({
      where: { name: "Ready to Assign", userId },
      select: { id: true },
    });

    if (!row) return null;

    return row.id;
  },

  getUncategorisedCategoryId: async (tx, userId) => {
    const row = await tx.category.findFirst({
      where: { name: "Uncategorised Transactions", userId },
      select: { id: true },
    });

    if (!row) return null;

    return row.id;
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
  createCategory: async (tx, categoryData) => {
    const row = await tx.category.create({ data: categoryData });

    return row;
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
    const rows = await tx.month.findMany({
      where: { category: { userId } },
      select: { month: true },
    });

    return rows.map((r) => r.month);
  },

  getMonthsForCategories: async (tx, categoryIds) => {
    const months = await tx.month.findMany({
      where: {
        categoryId: {
          in: categoryIds,
        },
      },
    });
    return months;
  },

  getEarliestPastMonth: async (tx, userId): Promise<Date> => {
    const res = await tx.month.aggregate({
      where: {
        category: { userId },
        month: { lte: new Date() },
      },
      _min: { month: true },
    });

    const earliest = res._min.month;

    if (!earliest) {
      throw new NoPastMonthsFoundError();
    }

    return earliest;
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

  getMonth: async (tx, userId, monthId) => {
    return await tx.month.findFirst({
      where: {
        id: monthId,
        category: {
          userId,
        },
      },
    });
  },

  getMonthsFromIds: async (
    tx: Prisma.TransactionClient,
    userId: UserId,
    monthIds: MonthId[]
  ): Promise<db.Month[]> => {
    return await tx.month.findMany({
      where: {
        id: { in: monthIds },
        category: {
          userId: userId,
        },
      },
    });
  },

  getMostRecentMonths: async (tx, userId) => {
    const mostRecentMonths = (await tx.$queryRaw(
      Prisma.sql`
    SELECT DISTINCT ON ("categoryId")
        m.id,
        m."categoryId",
        m.month,
        m.activity,
        m.assigned,
        m.available
    FROM
        "Month" m
    JOIN
        "Category" c ON m."categoryId" = c.id
    WHERE
        c."userId" = ${userId}
    ORDER BY
        m."categoryId",
        m.month DESC;
      `
    )) as db.Month[];

    return mostRecentMonths;
  },

  // ──────────────── Month Mutation ────────────────
  createMonths: async (tx, months) => {
    await tx.month.createMany({ data: months, skipDuplicates: true });
  },

  deleteMonthsByCategoryId: async (tx, categoryId) => {
    await tx.month.deleteMany({ where: { categoryId } });
  },

  // Efficiently update multiple months in a single SQL query.
  // Use a CASE statement per column to avoid multiple round-trips to the DB.
  // This is faster than updating each month individually when updating many rows.
  updateMonths: async (tx, updatedMonths) => {
    if (!updatedMonths.length) return;

    const ids = updatedMonths.map((m) => `'${m.id}'`);
    const activityCases: string[] = [];
    const assignedCases: string[] = [];
    const availableCases: string[] = [];

    updatedMonths.forEach((m) => {
      activityCases.push(`WHEN id='${m.id}' THEN ${m.activity.toString()}`);
      assignedCases.push(`WHEN id='${m.id}' THEN ${m.assigned.toString()}`);
      availableCases.push(`WHEN id='${m.id}' THEN ${m.available.toString()}`);
    });

    const sql = `
    UPDATE "Month"
    SET
      activity = CASE ${activityCases.join(" ")} END,
      assigned = CASE ${assignedCases.join(" ")} END,
      available = CASE ${availableCases.join(" ")} END
    WHERE id IN (${ids.join(", ")});
  `;

    await tx.$executeRawUnsafe(sql);
  },
};
