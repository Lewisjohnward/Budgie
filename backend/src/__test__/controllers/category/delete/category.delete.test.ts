import { getUserCategoriesByCategoryGroupId } from "../../../utils/appSnapshot";
import { registerUser, login, register } from "../../../utils/auth";
import { getUncategorisedCategory } from "../../../utils/category";
import { createCategory } from "../../../utils/category/category.create";
import { deleteCategoryRaw } from "../../../utils/category/category.delete";
import { createGroupWithCategory } from "../../../utils/scenarios/createGroupWithCategory";
import { createTransactionForCategory } from "../../../utils/scenarios/createTransactionForCategory";
import path from "node:path";
import jestOpenAPI from "jest-openapi";

jestOpenAPI(path.resolve(__dirname, "../../../../../docs/api/openapi.yml"));

describe("Category", () => {
  let cookie: string;
  let categoryId: string;
  let categoryGroupId: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    // Create a category
    const { category, categoryGroup } = await createGroupWithCategory(cookie);
    categoryId = category.id;
    categoryGroupId = categoryGroup.id;
  });
  describe("Delete", () => {
    describe("Error Cases", () => {
      it("Should return 401 on unauthenticated requests ", async () => {
        const res = await deleteCategoryRaw("invalid-cookie", "invalid-id");

        expect(res.status).toBe(401);
      });
      it("Should return 404 if user doesn't own category", async () => {
        const otherUserCookie = await register({
          email: "test1@test.com",
          password: "testpasswordABC$",
        });

        const { category: otherUserCategory } =
          await createGroupWithCategory(otherUserCookie);

        // Delete category using unowned category group
        const res = await deleteCategoryRaw(cookie, otherUserCategory.id);
        expect(res.status).toBe(404);
      });
      it("Should return 404 if category doesn't exist", async () => {
        const res = await deleteCategoryRaw(
          cookie,
          "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d"
        );
        expect(res.status).toBe(404);
      });

      it("Should return 404 if user doesn't own inheriting category", async () => {
        const otherUserCookie = await register({
          email: "test1@test.com",
          password: "testpasswordABC$",
        });

        const { category: otherUserCategory } =
          await createGroupWithCategory(otherUserCookie);

        await createTransactionForCategory(cookie, categoryId);

        // Delete category using unowned category group
        const res = await deleteCategoryRaw(cookie, categoryId, {
          inheritingCategoryId: otherUserCategory.id,
        });
        expect(res.status).toBe(404);
      });

      it("Should return 404 if inheriting category doesn't exist", async () => {
        await createTransactionForCategory(cookie, categoryId);

        // Delete category using unowned category group
        const res = await deleteCategoryRaw(cookie, categoryId, {
          inheritingCategoryId: "8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d",
        });
        expect(res.status).toBe(404);
      });
      it("Should return 422 if inheriting category is category being deleted", async () => {
        await createTransactionForCategory(cookie, categoryId);

        // Delete category using unowned category group
        const res = await deleteCategoryRaw(cookie, categoryId, {
          inheritingCategoryId: categoryId,
        });
        expect(res.status).toBe(422);
      });

      it("Should return 403 when inheriting category is a system category", async () => {
        // Get a system category group
        const uncategorisedCategory = await getUncategorisedCategory(cookie);

        await createTransactionForCategory(cookie, categoryId);

        // Delete category using system category group id
        const res = await deleteCategoryRaw(cookie, categoryId, {
          inheritingCategoryId: uncategorisedCategory.id,
        });

        expect(res.status).toBe(403);
      });
      it("Should return 422 when category has transactions but no inheriting id is provided", async () => {
        await createTransactionForCategory(cookie, categoryId);

        // Delete category without providing inheriting category id
        const res = await deleteCategoryRaw(cookie, categoryId);
        expect(res.status).toBe(422);
      });
    });
    describe("Success", () => {
      it("Should return 200 when deleting a category", async () => {
        const res = await deleteCategoryRaw(cookie, categoryId);
        expect(res.status).toBe(200);
      });
      it("Should reposition other categories to fill the gap", async () => {
        // Create a second category in same group
        await createCategory(cookie, {
          name: "second",
          categoryGroupId: categoryGroupId,
        });
        // Create a third category in same group
        await createCategory(cookie, {
          name: "third",
          categoryGroupId: categoryGroupId,
        });

        const categoriesBefore = await getUserCategoriesByCategoryGroupId(
          cookie,
          categoryGroupId
        );

        // Delete first category
        await deleteCategoryRaw(cookie, categoryId);

        const categoriesAfter = await getUserCategoriesByCategoryGroupId(
          cookie,
          categoryGroupId
        );

        const changeInLength = categoriesBefore.length - categoriesAfter.length;

        // Ensure change in length is 1
        expect(changeInLength).toBe(1);

        // Ensure positions are contiguous starting from 0
        const sorted = categoriesAfter.sort((a, b) => a.position - b.position);

        sorted.forEach((category, index) => {
          expect(category.position).toBe(index);
        });

        // Ensure no gaps exist
        const positions = sorted.map((c) => c.position);
        const unique = new Set(positions);

        expect(unique.size).toBe(positions.length);
      });
      it("Should return a complete delete category DTO", async () => {
        // Create a second category to test reindexing + updates
        const categoryB = await createCategory(cookie, {
          name: "category-b",
          categoryGroupId,
        });

        // Create a transaction for inheriting
        await createTransactionForCategory(cookie, categoryId);

        const { body } = await deleteCategoryRaw(cookie, categoryId, {
          inheritingCategoryId: categoryB.id,
        });

        // Check structure
        expect(body).toHaveProperty("deleted");
        expect(body).toHaveProperty("updated");

        expect(body.deleted).toHaveProperty("category");
        expect(body.deleted).toHaveProperty("months");

        expect(body.updated).toHaveProperty("categories");
        expect(body.updated).toHaveProperty("transactions");
        expect(body.updated).toHaveProperty("months");

        // Check deleted category
        expect(body.deleted.category.id).toBe(categoryId);
        expect(body.deleted.category).toMatchObject({
          id: categoryId,
          categoryGroupId,
        });

        // Check deleted months
        const deletedMonths = Object.values(body.deleted.months);
        expect(deletedMonths.length).toBeGreaterThan(0);

        deletedMonths.forEach((m) => {
          expect(m).toHaveProperty("id");
          expect(m).toHaveProperty("categoryId");
          expect(m.categoryId).toBe(categoryId);
        });

        // Check updated transactions
        const updatedTransactions = Object.values(body.updated.transactions);

        expect(updatedTransactions.length).toBeGreaterThan(0);

        updatedTransactions.forEach((t) => {
          expect(t).toHaveProperty("id");
          expect(t.categoryId).toBe(categoryB.id);
        });

        // Check updated months
        const updatedMonths = Object.values(body.updated.months);

        expect(updatedMonths.length).toBeGreaterThan(0);

        updatedMonths.forEach((m) => {
          expect(m).toHaveProperty("id");
          expect(m).toHaveProperty("categoryId");
        });

        // Check updated categories
        const updatedCategories = Object.values(body.updated.categories);

        expect(updatedCategories.length).toBeGreaterThan(0);

        // Deleted category must not exist in updated categories
        const stillExists = updatedCategories.some((c) => c.id === categoryId);
        expect(stillExists).toBe(false);

        // ordering invariant still holds (positions contiguous)
        const sorted = [...updatedCategories].sort(
          (a, b) => a.position - b.position
        );

        sorted.forEach((c, i) => {
          expect(c.position).toBe(i);
        });

        // Every updated transaction categoryId must match inheriting category
        for (const tx of updatedTransactions) {
          expect(tx.categoryId).toBe(categoryB.id);
        }
      });
      it("Should return deleted months", async () => {
        const { body } = await deleteCategoryRaw(cookie, categoryId);

        expect(Object.values(body.deleted.months).length).toBeGreaterThan(0);
      });
      it("Should reassign transactions when inheritingCategoryId is provided", async () => {
        // Create inheriting category
        const { category: inheritingCategory } =
          await createGroupWithCategory(cookie);
        await createTransactionForCategory(cookie, categoryId);

        const { body } = await deleteCategoryRaw(cookie, categoryId, {
          inheritingCategoryId: inheritingCategory.id,
        });

        const updatedTransactions = Object.values(body.updated.transactions);

        expect(updatedTransactions).toHaveLength(1);

        expect(updatedTransactions[0].categoryId).toBe(inheritingCategory.id);
      });
      it("Should persist category deletion and reorder positions in DB", async () => {
        // Create additional categories in same group
        await createCategory(cookie, {
          name: "second",
          categoryGroupId,
        });

        await createCategory(cookie, {
          name: "third",
          categoryGroupId,
        });

        // Before delete
        const before = await getUserCategoriesByCategoryGroupId(
          cookie,
          categoryGroupId
        );

        const beforeIds = before.map((c) => c.id);

        // Delete first category
        await deleteCategoryRaw(cookie, categoryId);

        // After delete
        const after = await getUserCategoriesByCategoryGroupId(
          cookie,
          categoryGroupId
        );

        // Category is actually gone
        expect(after.map((c) => c.id)).not.toContain(categoryId);

        // Size decreased correctly
        expect(after.length).toBe(before.length - 1);

        // Ordering is correct (critical invariant)
        const sorted = [...after].sort((a, b) => a.position - b.position);

        expect(sorted.map((c) => c.position)).toEqual([0, 1]);

        // No gaps
        const positions = sorted.map((c) => c.position);
        expect(new Set(positions).size).toBe(positions.length);

        // Stable ordering matches expected remaining IDs order
        expect(sorted.map((c) => c.id)).toEqual(
          beforeIds.filter((id) => id !== categoryId)
        );
      });
    });
  });
});
