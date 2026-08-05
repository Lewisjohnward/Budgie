import { createAccountAndFetch } from "../../utils/account";
import { getCategoryGroups } from "../../utils/appSnapshot";
import { getMonthsForCategories } from "../../utils/assign";
import { login, registerUser } from "../../utils/auth";
import { getRTACategory } from "../../utils/category";
import { createCategoryGroup } from "../../utils/category-group/categoryGroup.create";
import { deleteCategoryGroupRaw } from "../../utils/category-group/categoryGroup.delete";
import { createCategory } from "../../utils/category/category.create";
import { getProtectedCategoryGroups } from "../../utils/categoryGroup";
import { createGroupWithCategory } from "../../utils/scenarios/createGroupWithCategory";
import { createTransactionForCategory } from "../../utils/scenarios/createTransactionForCategory";
import {
  createTransaction,
  getTransactionIds,
  getTransactionsForAccountId,
} from "../../utils/transaction";
import { TestCategory, TestCategoryGroup } from "../../utils/types/models";

describe("Category group", () => {
  let cookie: string;
  let testCategoryGroup: TestCategoryGroup;
  let category: TestCategory;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    const temp = await createGroupWithCategory(cookie);
    testCategoryGroup = temp.categoryGroup;
    category = temp.category;
  });
  describe("Delete", () => {
    describe("Error cases", () => {
      it("Should return 401 on unauthenticated requests", async () => {
        // Delete category group
        const res = await deleteCategoryGroupRaw("invalid-cookie", "some-id");

        expect(res.status).toBe(401);
      });
      it("Should prevent deleting protected categories", async () => {
        // Get category protected category groups
        const protectedGroups = await getProtectedCategoryGroups(cookie);

        for (const group of Object.values(protectedGroups)) {
          // Delete category group
          const res = await deleteCategoryGroupRaw(cookie, group.id);

          expect(res.status).toBe(403);
        }
      });
      it("Should return 404 when category group does not exist", async () => {
        // Delete category group
        const res = await deleteCategoryGroupRaw(
          cookie,
          "00000000-0000-0000-0000-000000000000"
        );

        expect(res.status).toBe(404);
      });
      it("Should return 404 when deleting another user's category group", async () => {
        // Register a another user
        await registerUser({
          email: "other@test.com",
          password: "testpasswordABC$",
        });

        // Login another user
        const otherCookie = await login({
          email: "other@test.com",
          password: "testpasswordABC$",
        });

        // Create category group for another user
        const categoryGroup = await createCategoryGroup(otherCookie, {
          name: "OTHER_GROUP",
        });

        const res = await deleteCategoryGroupRaw(cookie, categoryGroup.id);

        expect(res.status).toBe(404);
      });

      describe("With transactions", () => {
        it("Should return 403 when inheriting category is protected", async () => {
          const rtaCategory = await getRTACategory(cookie);

          await createTransactionForCategory(cookie, category.id, "4");

          const res = await deleteCategoryGroupRaw(
            cookie,
            testCategoryGroup.id,
            rtaCategory.id
          );

          expect(res.status).toBe(403);
        });

        it("Should return 400 when category group has transactions but no inheriting category id", async () => {
          await createTransactionForCategory(cookie, category.id, "4");

          const res = await deleteCategoryGroupRaw(
            cookie,
            testCategoryGroup.id
          );

          expect(res.status).toBe(400);
        });

        it("Should return 404 when inheriting category doesn't exist", async () => {
          await createTransactionForCategory(cookie, category.id, "4");

          const res = await deleteCategoryGroupRaw(
            cookie,
            testCategoryGroup.id,
            "7f3c2d91-8a44-4b2d-b6f1-3e9a1c5d7f20"
          );

          expect(res.status).toBe(404);
        });

        it("Should return 400 when inheriting category is owned by category group being deleted", async () => {
          // Create category for g1
          const categoryA = await createCategory(cookie, {
            name: "cat-a",
            categoryGroupId: testCategoryGroup.id,
          });

          // Create another category for g1
          const categoryB = await createCategory(cookie, {
            name: "cat-b",
            categoryGroupId: testCategoryGroup.id,
          });

          await createTransactionForCategory(cookie, categoryA.id, "4");

          const res = await deleteCategoryGroupRaw(
            cookie,
            testCategoryGroup.id,
            categoryB.id
          );

          expect(res.status).toBe(400);
        });
        it("Should return 404 when inheriting category id isn't owned by user", async () => {
          // Register other account
          await registerUser({
            email: "other@test.com",
            password: "testpasswordABC$",
          });

          // Login other account
          const otherCookie = await login({
            email: "other@test.com",
            password: "testpasswordABC$",
          });

          const { category: notOwnedCategory } =
            await createGroupWithCategory(otherCookie);

          await createTransactionForCategory(cookie, category.id, "4");

          const res = await deleteCategoryGroupRaw(
            cookie,
            testCategoryGroup.id,
            notOwnedCategory.id
          );

          expect(res.status).toBe(404);
        });
      });
    });

    describe("Success", () => {
      it("Should delete a category group and reindex groups", async () => {
        const before = await getCategoryGroups(cookie);

        const res = await deleteCategoryGroupRaw(cookie, testCategoryGroup.id);

        expect(res.status).toBe(200);

        const after = await getCategoryGroups(cookie);

        const exists = Object.values(after.user).some(
          (group) => group.id === testCategoryGroup.id
        );

        expect(exists).toBe(false);

        // invariant: positions reindexed
        const positions = Object.values(after.user).map((g) => g.position);

        expect(positions).toEqual(
          Array.from({ length: positions.length }, (_, i) => i)
        );

        // size decreased
        expect(Object.keys(after.user).length).toBe(
          Object.keys(before.user).length - 1
        );
      });
      it("Should reassign transactions to inheriting category and return DTO", async () => {
        const { category: categoryA, categoryGroup: categoryGroupA } =
          await createGroupWithCategory(cookie);
        const { category: categoryB } = await createGroupWithCategory(cookie);

        // create account
        const testAccount = await createAccountAndFetch(cookie, 0);

        // Create transactions assigned to cat-a
        const resultA = await createTransaction(cookie, {
          accountId: testAccount.id,
          categoryId: categoryA.id,
          outflow: "4",
        });

        const resultB = await createTransaction(cookie, {
          accountId: testAccount.id,
          categoryId: categoryA.id,
          outflow: "4",
        });

        // Group before transactions
        const txIdsBefore = [
          ...getTransactionIds(resultA),
          ...getTransactionIds(resultB),
        ];

        // Get months before
        const monthsBefore = await getMonthsForCategories(cookie, [
          categoryB.id,
        ]);
        //@ts-ignore-error: need to change map into dto
        const beforeMonth = monthsBefore[categoryB.id][0];

        // Delete test category group, and assign transactions to category b
        const { body } = await deleteCategoryGroupRaw(
          cookie,
          categoryGroupA.id,
          categoryB.id
        );

        // ----------------------------
        // DTO assertions
        // ----------------------------

        expect(body.deleted.categoryGroup.id).toBe(categoryGroupA.id);

        expect(body.updated.transactions).toBeDefined();
        expect(Object.keys(body.updated.transactions).length).toBe(2);

        // Ensure DTO shows reassignment correctly
        for (const txId of txIdsBefore) {
          const updatedTx = body.updated.transactions[txId];
          expect(updatedTx).toBeDefined();
          expect(updatedTx.categoryId).toBe(categoryB.id);
        }

        // ----------------------------
        // Check transactions
        // ----------------------------

        const transactions = await getTransactionsForAccountId(
          cookie,
          testAccount.id
        );

        const updatedTxs = transactions.filter((t) =>
          txIdsBefore.includes(t.id)
        );

        for (const tx of updatedTxs) {
          expect(tx.categoryId).toBe(categoryB.id);
        }

        // ----------------------------
        // Check months
        // ----------------------------

        const monthsAfter = await getMonthsForCategories(cookie, [
          categoryB.id,
        ]);

        //@ts-ignore-error: need to change map into dto
        const afterMonth = monthsAfter[categoryB.id][0];

        expect(afterMonth.activity).toBe(beforeMonth.activity - 8);
        expect(afterMonth.available).toBe(beforeMonth.available - 8);
      });
    });
  });
});
