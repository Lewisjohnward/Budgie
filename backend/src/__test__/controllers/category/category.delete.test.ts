import { getInflowCategoryGroup } from "../../utils/appSnapshot";
import { registerUser, login, register } from "../../utils/auth";
import { getUncategorisedCategory } from "../../utils/category";
import { deleteCategoryRaw } from "../../utils/category/category.delete";
import { createGroupWithCategory } from "../../utils/scenarios/createGroupWithCategory";
import { createTransactionForCategory } from "../../utils/scenarios/createTransactionForCategory";

describe("Category", () => {
  let cookie: string;
  let categoryId: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    // Create a category group and category
    const { category } = await createGroupWithCategory(cookie);
    categoryId = category.id;
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
      it("Should return a delete category dto", async () => {
        const { body } = await deleteCategoryRaw(cookie, categoryId);
        expect(body.deleted.category.id).toBe(categoryId);
        expect(body).toHaveProperty("updated");
        expect(body.deleted.category.id).toBe(categoryId);
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
    });
  });
});
