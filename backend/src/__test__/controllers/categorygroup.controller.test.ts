import { createAccountAndFetch } from "../utils/account";
import { getMonthsForCategories } from "../utils/assign";
import { login, registerUser } from "../utils/auth";
import {
  createCategory,
  fetchCategoryByName,
  getRTACategory,
} from "../utils/category";
import {
  createCategoryGroup,
  createTestCategoryGroups,
  deleteCategoryGroup,
  getCategoryGroupByNameOrThrow,
  getCategoryGroups,
  getCategoryGroupsRaw,
  getProtectedCategoryGroups,
  getTestCategoryGroup,
  updateCategoryGroup,
} from "../utils/categoryGroup";
import {
  addTransaction,
  getTransactionsForAccountId,
} from "../utils/transaction";

describe("Category group", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
  describe("Get", () => {
    describe("Error Cases", () => {
      it("Should return 401 on unauthenticated requests", async () => {
        const res = await getCategoryGroupsRaw("invalid-cookie");

        expect(res.statusCode).toBe(401);
      });
    });
    describe("Success", () => {
      it("Should return category groups for user", async () => {
        const categoryGroupMap = await getCategoryGroups(cookie);

        expect(categoryGroupMap).toBeDefined();
        expect(categoryGroupMap.user).toBeDefined();
        expect(categoryGroupMap.system).toBeDefined();
        const group = Object.values(categoryGroupMap.user)[0];

        expect(group).toHaveProperty("id");
        expect(group).toHaveProperty("name");
        expect(group).toHaveProperty("position");
      });
    });
  });
  describe("Create", () => {
    describe("Error cases", () => {
      it("Should return 401 on unauthenticated requests", async () => {
        const res = await createCategoryGroup("0000", { name: "test" });

        expect(res.statusCode).toBe(401);
      });
      it("Should return 409 on name collision", async () => {
        await createCategoryGroup(cookie, { name: "test" });

        const res = await createCategoryGroup(cookie, { name: "test" });

        expect(res.statusCode).toBe(409);

        const groups = await getCategoryGroups(cookie);
        const matches = Object.values(groups.user).filter(
          (g) => g.name === "test"
        );

        expect(matches).toHaveLength(1);
      });
    });
    describe("Success", () => {
      it("Should create a category group and return it", async () => {
        const before = await getCategoryGroups(cookie);

        const res = await createCategoryGroup(cookie, { name: "new-group" });

        expect(res.statusCode).toBe(201);

        // response should return the created category group
        expect(res.body).toBeDefined();
        expect(res.body.name).toBe("new-group");

        const after = await getCategoryGroups(cookie);

        // verify it exists in persisted state
        const created = Object.values(after.user).find(
          (g) => g.name === "new-group"
        );

        expect(created).toBeDefined();
        expect(created!.name).toBe("new-group");

        // position
        const positions = Object.values(after.user).map((g) => g.position);

        expect(new Set(positions).size).toBe(positions.length);

        expect(positions).toEqual(
          Array.from({ length: positions.length }, (_, i) => i)
        );

        // count increased
        expect(Object.keys(after.user).length).toBe(
          Object.keys(before.user).length + 1
        );
      });
    });
  });

  describe("Update", () => {
    describe("Error Cases", () => {
      it("Should return 401 on unauthenticated requests", async () => {
        const res = await updateCategoryGroup("invalid-id", "invalid-cookie");

        expect(res.statusCode).toBe(401);
      });

      it("Should return 403 when editing system categories", async () => {
        const protectedCategoryGroups =
          await getProtectedCategoryGroups(cookie);

        // TODO:(lewis 2026-05-21 02:14) maybe put this inside getProtectedCategoryGroups
        const protectedCategoryGroupsArray = Object.values(
          protectedCategoryGroups
        );

        for (const group of protectedCategoryGroupsArray) {
          const res = await updateCategoryGroup(cookie, group.id, {
            name: "SHOULD_NOT_WORK",
          });

          expect(res.statusCode).toBe(403);
        }
      });

      it("Should return 400 when providing name and position", async () => {
        const testCategoryGroup = await getTestCategoryGroup(cookie);
        const res = await updateCategoryGroup(cookie, testCategoryGroup.id, {
          name: "SHOULD_NOT_WORK",
          position: 0,
        });
        expect(res.statusCode).toBe(400);
      });

      it("Should return 404 when category group does not exist", async () => {
        const res = await updateCategoryGroup(
          cookie,
          "00000000-0000-0000-0000-000000000000",
          {
            name: "FAIL",
          }
        );

        expect(res.statusCode).toBe(404);
      });
      it("Should return 404 when category group belongs to another user", async () => {
        await registerUser({
          email: "test1@test.com",
          password: "testpasswordABC$",
        });

        const otherUserCookie = await login({
          email: "test1@test.com",
          password: "testpasswordABC$",
        });

        const { body: otherUserGroup } = await createCategoryGroup(
          otherUserCookie,
          {
            name: "Other Group",
          }
        );

        const res = await updateCategoryGroup(cookie, otherUserGroup.id, {
          name: "NOT_ALLOWED",
        });

        expect(res.statusCode).toBe(404);
      });
    });

    describe("Name", () => {
      describe("Error cases", () => {
        it("Should return 409 on name collision", async () => {
          await createCategoryGroup(cookie, {
            name: "TEST_CATEGORY",
          });

          const testCategoryGroup = await getCategoryGroupByNameOrThrow(
            cookie,
            "test category group"
          );

          const res = await updateCategoryGroup(cookie, testCategoryGroup.id, {
            name: "TEST_CATEGORY",
          });

          expect(res.statusCode).toBe(409);
        });
      });
      describe("Success", () => {
        it("Should correctly update name", async () => {
          const testCategoryGroup = await getTestCategoryGroup(cookie);
          const res = await updateCategoryGroup(cookie, testCategoryGroup.id, {
            name: "UPDATED_NAME",
          });

          expect(res.statusCode).toBe(201);
          await getCategoryGroupByNameOrThrow(cookie, "UPDATED_NAME");
        });
      });
    });
    describe("Position", () => {
      describe("Error cases", () => {
        it("Should return 400 when setting arbitrary positions", async () => {
          const testCategoryGroup = await getTestCategoryGroup(cookie);

          const categoryGroups = await getCategoryGroups(cookie);

          const invalidPosition = Object.keys(categoryGroups.user).length + 100;

          const res = await updateCategoryGroup(cookie, testCategoryGroup.id, {
            position: invalidPosition,
          });

          expect(res.statusCode).toBe(400);
        });
        it("Should return 400 on negative positions", async () => {
          const testCategoryGroup = await getTestCategoryGroup(cookie);

          const res = await updateCategoryGroup(cookie, testCategoryGroup.id, {
            position: -1,
          });

          expect(res.statusCode).toBe(400);
        });
      });

      describe("Success", () => {
        it("Should return updated category group", async () => {
          expect.hasAssertions();
        });
        it("Should move category group up in position order", async () => {
          // Seed test categories so there are enough to reposition
          await createTestCategoryGroups(cookie);
          const categoryGroupsBefore = await getCategoryGroups(cookie);

          const categoryGroupsBeforeArray = Object.values(
            categoryGroupsBefore.user
          ).sort((a, b) => a.position - b.position);

          // pick a non-edge item so move up is always valid
          const targetGroup = categoryGroupsBeforeArray[2];
          const originalPosition = targetGroup.position;

          const newPosition = originalPosition - 1;

          const res = await updateCategoryGroup(cookie, targetGroup.id, {
            position: newPosition,
          });

          expect(res.statusCode).toBe(201);

          const categoryGroupsAfter = await getCategoryGroups(cookie);

          const categoryGroupsAfterArray = Object.values(
            categoryGroupsAfter.user
          ).sort((a, b) => a.position - b.position);

          const movedGroupAfter = categoryGroupsAfterArray.find(
            (g) => g.id === targetGroup.id
          );

          expect(movedGroupAfter).toBeDefined();
          expect(movedGroupAfter!.position).toBe(newPosition);

          // Strong ordering assertion
          const positions = categoryGroupsAfterArray.map((g) => g.position);

          expect(positions).toEqual(
            Array.from({ length: positions.length }, (_, i) => i)
          );
        });
        it("Should move category group down in position order", async () => {
          // Seed test categories so there are enough to reposition
          await createTestCategoryGroups(cookie);
          const before = await getCategoryGroups(cookie);

          const groups = Object.values(before.user).sort(
            (a, b) => a.position - b.position
          );

          const target = groups[1];
          const newPosition = 0;

          const res = await updateCategoryGroup(cookie, target.id, {
            position: newPosition,
          });

          expect(res.statusCode).toBe(201);

          const after = await getCategoryGroups(cookie);

          const afterList = Object.values(after.user).sort(
            (a, b) => a.position - b.position
          );

          // Correct length (no duplicates / missing)
          expect(afterList).toHaveLength(groups.length);

          // Target moved correctly
          const moved = afterList.find((g) => g.id === target.id);
          expect(moved?.position).toBe(newPosition);

          // No duplicate positions
          const positions = afterList.map((g) => g.position);
          const uniquePositions = new Set(positions);
          expect(uniquePositions.size).toBe(positions.length);

          // Strong ordering assertion
          expect(positions).toEqual(
            Array.from({ length: positions.length }, (_, i) => i)
          );

          // Ordering must match position order exactly
          expect(afterList.map((g) => g.id)).toEqual(
            afterList
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((g) => g.id)
          );
        });
      });
    });
  });

  describe("Delete", () => {
    describe("Error cases", () => {
      it("Should return 401 on unauthenticated requests", async () => {
        const res = await deleteCategoryGroup("invalid-cookie", "some-id");

        expect(res.statusCode).toBe(401);
      });

      it("Should prevent deleting protected categories", async () => {
        const protectedGroups = await getProtectedCategoryGroups(cookie);

        for (const group of Object.values(protectedGroups)) {
          const res = await deleteCategoryGroup(cookie, group.id);

          expect(res.statusCode).toBe(403);
        }
      });

      it("Should return 404 when category group does not exist", async () => {
        const res = await deleteCategoryGroup(
          cookie,
          "00000000-0000-0000-0000-000000000000"
        );

        expect(res.statusCode).toBe(404);
      });

      it("Should return 404 when deleting another user's category group", async () => {
        await registerUser({
          email: "other@test.com",
          password: "testpasswordABC$",
        });

        const otherCookie = await login({
          email: "other@test.com",
          password: "testpasswordABC$",
        });

        const { body } = await createCategoryGroup(otherCookie, {
          name: "OTHER_GROUP",
        });

        const res = await deleteCategoryGroup(cookie, body.id);

        expect(res.statusCode).toBe(404);
      });

      describe("With transactions", () => {
        it("Should return 403 when inheriting category is protected", async () => {
          const rtaCategory = await getRTACategory(cookie);
          const g = await getTestCategoryGroup(cookie);

          // Create category
          await createCategory(cookie, {
            name: "cat-a",
            categoryGroupId: g.id,
          });
          const catA = await fetchCategoryByName(cookie, "cat-a");

          // Create account
          const testAccount = await createAccountAndFetch(cookie, 0);

          // Create transactions assigned to cat-a
          await addTransaction(cookie, {
            accountId: testAccount.id,
            categoryId: catA.id,
            outflow: "4",
          });

          const res = await deleteCategoryGroup(cookie, g.id, rtaCategory.id);

          expect(res.statusCode).toBe(403);
        });
        it("Should return 400 when category group has transactions but no inheriting category id", async () => {
          const g = await getTestCategoryGroup(cookie);

          // Create category
          await createCategory(cookie, {
            name: "cat-a",
            categoryGroupId: g.id,
          });
          const catA = await fetchCategoryByName(cookie, "cat-a");

          // Create account
          const testAccount = await createAccountAndFetch(cookie, 0);

          // Create transactions assigned to cat-a
          await addTransaction(cookie, {
            accountId: testAccount.id,
            categoryId: catA.id,
            outflow: "4",
          });

          const res = await deleteCategoryGroup(cookie, g.id);

          expect(res.statusCode).toBe(400);
        });
        it("Should return 404 when inheriting category doesn't exist", async () => {
          const testGroups = await createTestCategoryGroups(cookie);
          const { g1 } = testGroups;

          // Create category
          await createCategory(cookie, {
            name: "cat-a",
            categoryGroupId: g1.id,
          });
          const catA = await fetchCategoryByName(cookie, "cat-a");

          // Create account
          const testAccount = await createAccountAndFetch(cookie, 0);

          // Create transactions assigned to cat-a
          await addTransaction(cookie, {
            accountId: testAccount.id,
            categoryId: catA.id,
            outflow: "4",
          });

          const res = await deleteCategoryGroup(
            cookie,
            g1.id,
            "7f3c2d91-8a44-4b2d-b6f1-3e9a1c5d7f20"
          );

          expect(res.statusCode).toBe(404);
        });

        it("Should return 400 when inheriting category is owned by category group being deleted", async () => {
          const testGroups = await createTestCategoryGroups(cookie);
          const { g1 } = testGroups;

          // Create category for g1
          await createCategory(cookie, {
            name: "cat-a",
            categoryGroupId: g1.id,
          });
          const catA = await fetchCategoryByName(cookie, "cat-a");

          // Create another category for g1
          await createCategory(cookie, {
            name: "cat-b",
            categoryGroupId: g1.id,
          });
          const catB = await fetchCategoryByName(cookie, "cat-b");

          // Create account
          const testAccount = await createAccountAndFetch(cookie, 0);

          // Create transactions assigned to cat-a
          await addTransaction(cookie, {
            accountId: testAccount.id,
            categoryId: catA.id,
            outflow: "4",
          });

          const res = await deleteCategoryGroup(cookie, g1.id, catB.id);

          expect(res.statusCode).toBe(400);
        });
        it("Should return 404 when inheriting category id isn't owned by user", async () => {
          const testGroups = await createTestCategoryGroups(cookie);
          const { g1 } = testGroups;

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

          // Create category group for other user
          const { body } = await createCategoryGroup(otherCookie, {
            name: "OTHER_GROUP",
          });

          // Create category for g1
          await createCategory(cookie, {
            name: "cat-a",
            categoryGroupId: g1.id,
          });
          const catA = await fetchCategoryByName(cookie, "cat-a");

          // Create account
          const testAccount = await createAccountAndFetch(cookie, 0);

          // Create transactions assigned to cat-a
          await addTransaction(cookie, {
            accountId: testAccount.id,
            categoryId: catA.id,
            outflow: "4",
          });

          // Create category for other user
          await createCategory(otherCookie, {
            name: "not-owned",
            categoryGroupId: body.id,
          });
          const notOwnedCategory = await fetchCategoryByName(
            otherCookie,
            "not-owned"
          );

          const res = await deleteCategoryGroup(
            cookie,
            g1.id,
            notOwnedCategory.id
          );

          expect(res.statusCode).toBe(404);
        });
      });
    });

    describe("Success", () => {
      it("Should delete a category group and reindex groups", async () => {
        const g = await getTestCategoryGroup(cookie);

        const before = await getCategoryGroups(cookie);

        const res = await deleteCategoryGroup(cookie, g.id);

        expect(res.statusCode).toBe(200);

        const after = await getCategoryGroups(cookie);

        const exists = Object.values(after.user).some(
          (group) => group.id === g.id
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
      it("Should reassign transactions to inheriting category and returns DTO", async () => {
        const testGroups = await createTestCategoryGroups(cookie);

        const { g1, g2 } = testGroups;

        // create account
        const testAccount = await createAccountAndFetch(cookie, 0);

        // create category a of test category group
        await createCategory(cookie, {
          name: "cat-a",
          categoryGroupId: g1.id,
        });
        const catA = await fetchCategoryByName(cookie, "cat-a");

        // create category b of different test category group
        await createCategory(cookie, {
          name: "cat-b",
          categoryGroupId: g2.id,
        });
        const catB = await fetchCategoryByName(cookie, "cat-b");

        // Create transactions assigned to cat-a
        const txA = await addTransaction(cookie, {
          accountId: testAccount.id,
          categoryId: catA.id,
          outflow: "4",
        });

        const txB = await addTransaction(cookie, {
          accountId: testAccount.id,
          categoryId: catA.id,
          outflow: "4",
        });

        // Group before transactions
        const txIdsBefore = [txA.id, txB.id];

        // Get months before
        const monthsBefore = await getMonthsForCategories(cookie, [catB.id]);

        // Delete test category group, and assign transactions to category b
        const res = await deleteCategoryGroup(cookie, g1.id, catB.id);
        console.log("res:", res.body);

        expect(res.statusCode).toBe(200);

        // DTO check
        expect(res.body.deletedCategoryGroupId).toBe(g1.id);
        expect(Object.keys(res.body.transactionReassignments).length).toBe(2);

        // Get updated transactions
        const transactions = await getTransactionsForAccountId(
          cookie,
          testAccount.id
        );

        // Filter only test transactions
        const updatedTxs = transactions.filter((t) =>
          txIdsBefore.includes(t.id)
        );

        // Ensure transactions are assigned to new category
        for (const tx of updatedTxs) {
          expect(tx.categoryId).toBe(catB.id);
        }

        // Get months after
        const monthsAfter = await getMonthsForCategories(cookie, [catB.id]);

        // Assert that months are correct

        // Assert that category group is deleted

        // Assert that categories are deleted

        // Assert that months are deleted
      });
      // it("updates months correctly after reassignment", async () => {
      //   const group = await getTestCategoryGroup(cookie);
      //
      //   const before = await getMonthsForCategories(cookie, group.categoryIds);
      //
      //   const res = await deleteCategoryGroup(cookie, group.id);
      //
      //   expect(res.statusCode).toBe(200);
      //
      //   const after = await getMonthsForCategories(cookie, group.categoryIds);
      //
      //   for (const categoryId of group.categoryIds) {
      //     expect(after[categoryId]).toBeDefined();
      //   }
      // });
      it.todo("should transfer to inherting category");
    });
  });
});
// describe("Success", () => {
//   describe("when no transactions exist", ...)
//   describe("when transactions exist", ...)
//   describe("month updates", ...)
//   describe("dto shape", ...)
// });
