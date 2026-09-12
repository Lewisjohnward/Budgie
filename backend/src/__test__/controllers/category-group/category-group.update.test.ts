import { getCategoryGroups } from "../../utils/appSnapshot";
import { registerUser, login } from "../../utils/auth";
import {
  createCategoryGroupRaw,
  createCategoryGroup,
} from "../../utils/category-group/categoryGroup.create";
import {
  updateCategoryGroupRaw,
  getProtectedCategoryGroups,
  getTestCategoryGroup,
  getCategoryGroupByNameOrThrow,
  updateCategoryGroup,
} from "../../utils/categoryGroup";
import { createTestCategoryGroups } from "../../utils/scenarios/createTestCategoryGroups";

describe("Category group", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
  describe("Update", () => {
    describe("Error Cases", () => {
      it("Should return 401 on unauthenticated requests", async () => {
        const res = await updateCategoryGroupRaw(
          "invalid-id",
          "invalid-cookie"
        );

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
          const res = await updateCategoryGroupRaw(cookie, group.id, {
            name: "SHOULD_NOT_WORK",
          });

          expect(res.statusCode).toBe(403);
        }
      });

      it("Should return 400 when providing name and position", async () => {
        const testCategoryGroup = await getTestCategoryGroup(cookie);
        const res = await updateCategoryGroupRaw(cookie, testCategoryGroup.id, {
          name: "SHOULD_NOT_WORK",
          position: 0,
        });
        expect(res.statusCode).toBe(400);
      });

      it("Should return 404 when category group does not exist", async () => {
        const res = await updateCategoryGroupRaw(
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

        const { body: otherUserGroup } = await createCategoryGroupRaw(
          otherUserCookie,
          {
            name: "Other Group",
          }
        );

        const res = await updateCategoryGroupRaw(
          cookie,
          otherUserGroup.created.categoryGroup.id,
          {
            name: "NOT_ALLOWED",
          }
        );

        expect(res.statusCode).toBe(404);
      });
    });

    describe("Name", () => {
      describe("Error cases", () => {
        it("Should return 409 on name collision", async () => {
          await createCategoryGroupRaw(cookie, {
            name: "TEST_CATEGORY",
          });

          const testCategoryGroup = await getCategoryGroupByNameOrThrow(
            cookie,
            "test category group"
          );

          const res = await updateCategoryGroupRaw(
            cookie,
            testCategoryGroup.id,
            {
              name: "TEST_CATEGORY",
            }
          );

          expect(res.statusCode).toBe(409);
        });
      });
      describe("Success", () => {
        it("Should correctly update name", async () => {
          const testCategoryGroup = await getTestCategoryGroup(cookie);
          const res = await updateCategoryGroupRaw(
            cookie,
            testCategoryGroup.id,
            {
              name: "UPDATED_NAME",
            }
          );

          expect(res.statusCode).toBe(200);
          await getCategoryGroupByNameOrThrow(cookie, "UPDATED_NAME");
        });
        it("Should return updated category group", async () => {
          const categoryGroup = await createCategoryGroup(cookie, {
            name: "new-group",
          });
          const res = await updateCategoryGroup(cookie, categoryGroup.id, {
            name: "new-name",
          });
          expect(res.updated.categoryGroup.name).toBe("new-name");
        });
      });
    });
    describe("Position", () => {
      describe("Error cases", () => {
        it("Should return 400 when setting arbitrary positions", async () => {
          const testCategoryGroup = await getTestCategoryGroup(cookie);

          const categoryGroups = await getCategoryGroups(cookie);

          const invalidPosition = Object.keys(categoryGroups.user).length + 100;

          const res = await updateCategoryGroupRaw(
            cookie,
            testCategoryGroup.id,
            {
              position: invalidPosition,
            }
          );

          expect(res.statusCode).toBe(400);
        });
        it("Should return 400 on negative positions", async () => {
          const testCategoryGroup = await getTestCategoryGroup(cookie);

          const res = await updateCategoryGroupRaw(
            cookie,
            testCategoryGroup.id,
            {
              position: -1,
            }
          );

          expect(res.statusCode).toBe(400);
        });
      });

      describe("Success", () => {
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

          const res = await updateCategoryGroupRaw(cookie, targetGroup.id, {
            position: newPosition,
          });

          expect(res.statusCode).toBe(200);

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

          const res = await updateCategoryGroupRaw(cookie, target.id, {
            position: newPosition,
          });

          expect(res.statusCode).toBe(200);

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
});
