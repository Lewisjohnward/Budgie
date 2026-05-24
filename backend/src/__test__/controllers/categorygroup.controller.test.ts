import { UpdateCategoryGroupPayload } from "../../features/budget/core/categorygroup/categorygroup.schema";
import { login, registerUser } from "../utils/auth";
import {
  createCategoryGroup,
  getCategoryGroupByNameOrThrow,
  getCategoryGroups,
  getCategoryGroupsRaw,
  getProtectedCategoryGroups,
  getTestCategoryGroup,
  updateCategoryGroup,
} from "../utils/categoryGroup";

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
      it.todo("should prevent name collision");
      it.todo("should create a category group");
      it.todo("should correctly update position");
    });
    describe("Success", () => {
      it("Should return category groups for user", async () => {
        const categoryGroupMap = await getCategoryGroups(cookie);

        expect(categoryGroupMap).toBeDefined();

        const group = Object.values(categoryGroupMap)[0];

        expect(group).toHaveProperty("id");
        expect(group).toHaveProperty("name");
        expect(group).toHaveProperty("position");
      });
    });
  });
  describe("create", () => {
    it.todo("should prevent name collision");
    it.todo("should create a category group");
    it.todo("should correctly update position");
  });

  describe.only("update", () => {
    describe("Error Cases", () => {
      it("Should return 401 on unauthenticated requests", async () => {
        const res = await updateCategoryGroup("invalid-cookie");

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
          const res = await updateCategoryGroup(cookie, {
            categoryGroupId: group.id,
            name: "SHOULD_NOT_WORK",
          });

          expect(res.statusCode).toBe(403);
        }
      });

      it("Should return 400 when providing name and position", async () => {
        const testCategoryGroup = await getTestCategoryGroup(cookie);
        const res = await updateCategoryGroup(cookie, {
          categoryGroupId: testCategoryGroup.id,
          name: "SHOULD_NOT_WORK",
          position: 0,
        });
        expect(res.statusCode).toBe(400);
      });

      it("Should return 404 when category group does not exist", async () => {
        const res = await updateCategoryGroup(cookie, {
          categoryGroupId: "00000000-0000-0000-0000-000000000000",
          name: "FAIL",
        });

        expect(res.statusCode).toBe(404);
      });
      it("Should return 404 when category group belongs to another user", async () => {
        await registerUser();
        const otherUserCookie = await login({
          email: "test1@test.com",
          password: "testpasswordABC$",
        });

        const otherUserGroup = await createCategoryGroup(otherUserCookie, {
          name: "Other Group",
        });

        const res = await updateCategoryGroup(cookie, {
          categoryGroupId: otherUserGroup.id,
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

          const res = await updateCategoryGroup(cookie, {
            categoryGroupId: testCategoryGroup.id,
            name: "TEST_CATEGORY",
          });

          expect(res.statusCode).toBe(409);
        });
      });
      describe.only("Success", () => {
        it.only("Should correctly update name", async () => {
          const testCategoryGroup = await getTestCategoryGroup(cookie);
          const res = await updateCategoryGroup(cookie, {
            categoryGroupId: testCategoryGroup.id,
            name: "UPDATED_NAME",
          });

          expect(res.statusCode).toBe(201);
          const updatedCategoryGroup = await getCategoryGroupByNameOrThrow(
            cookie,
            "UPDATED_NAME"
          );
        });
      });

      describe("Position", () => {
        describe("Error cases", () => {
          it("Should return 400 when setting arbitrary positions", async () => {
            const testCategoryGroup = await getTestCategoryGroup(cookie);

            const categoryGroups = await getCategoryGroups(cookie);

            const invalidPosition = Object.keys(categoryGroups).length + 100;

            const res = await updateCategoryGroup(cookie, {
              categoryGroupId: testCategoryGroup.id,
              position: invalidPosition,
            });

            expect(res.statusCode).toBe(400);
          });
          it("Should return 400 on negative positions", async () => {
            const testCategoryGroup = await getTestCategoryGroup(cookie);

            const res = await updateCategoryGroup(cookie, {
              categoryGroupId: testCategoryGroup.id,
              position: -1,
            });

            expect(res.statusCode).toBe(400);
          });
        });

        describe("Success", () => {
          it.only("Should correctly update position", async () => {
            const categoryGroupsBefore = await getCategoryGroups(cookie);

            const targetGroup = Object.values(categoryGroupsBefore.user)[0];
            const originalPosition = targetGroup.position;

            const newPosition = originalPosition === 0 ? 1 : 0;

            const res = await updateCategoryGroup(cookie, {
              categoryGroupId: targetGroup.id,
              position: newPosition,
            });

            expect(res.statusCode).toBe(201);

            const categoryGroupsAfter = await getCategoryGroups(cookie);
            const categoryGroupsUserAfterArray = Object.values(
              categoryGroupsAfter.user
            );

            const movedGroupAfter = categoryGroupsUserAfterArray.find(
              (g) => g.id === targetGroup.id
            );

            expect(movedGroupAfter).toBeDefined();
            expect(movedGroupAfter!.position).toBe(newPosition);

            // Optional but strong assertion: ensure ordering consistency
            const sorted = [...categoryGroupsUserAfterArray].sort(
              (a, b) => a.position - b.position
            );

            expect(sorted.map((g) => g.id)).toEqual(
              categoryGroupsUserAfterArray.map((g) => g.id)
            );
          });
        });
      });
    });

    describe("delete", () => {
      it.todo("should delete category group");
      it.todo("should prevent user from deleting protected categories");
      it.todo("should update name");
      it.todo("should transfer to inherting category");
      it.todo("should prevent user deleting non existent / other users groups");
    });
  });
});
