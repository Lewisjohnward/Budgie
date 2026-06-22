import {
  getInflowCategoryGroup,
  getUserCategoriesByCategoryGroupId,
  getUserCategoryByIdOrThrow,
} from "../../utils/appSnapshot";
import { registerUser, login, register } from "../../utils/auth";
import { createCategoryGroup } from "../../utils/category-group/categoryGroup.create";
import {
  createCategory,
  createCategoryRaw,
} from "../../utils/category/category.create";
import { updateCategoryRaw } from "../../utils/category/category.update";
import { createGroupWithCategory } from "../../utils/scenarios/createGroupWithCategory";

describe("Category", () => {
  let cookie: string;
  let categoryGroupId: string;
  let categoryId: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    // Create category group and category
    const { category, categoryGroup } = await createGroupWithCategory(cookie);

    categoryId = category.id;
    categoryGroupId = categoryGroup.id;
  });
  describe("Update", () => {
    describe("Error Cases", () => {
      it("Should return 401 on unauthenticated requests ", async () => {
        const res = await updateCategoryRaw("invalid-cookie", "invalid-id", {
          name: "test-category",
          categoryGroupId: "invalid-group-id",
        });

        expect(res.status).toBe(401);
      });
      it("Should return 404 if user doesn't own category group", async () => {
        // Register user
        const otherUserCookie = await register({
          email: "test1@test.com",
          password: "testpasswordABC$",
        });

        // Create category group for other user
        const otherUserCategoryGroup = await createCategoryGroup(
          otherUserCookie,
          {
            name: "other-user-category-group",
          }
        );

        // Update category using unowned category group
        const res = await updateCategoryRaw(cookie, categoryId, {
          categoryGroupId: otherUserCategoryGroup.id,
          position: 1,
        });
        expect(res.status).toBe(404);
      });
      it("Should return 400 when sending out-of-range position", async () => {
        const res = await updateCategoryRaw(cookie, categoryId, {
          categoryGroupId,
          // invalid: out of bounds
          position: 5,
        });

        expect(res.status).toBe(400);
      });
      it("Should return 400 when position is negative", async () => {
        expect.hasAssertions();

        const res = await updateCategoryRaw(cookie, categoryId, {
          categoryGroupId,
          position: -1,
        });

        expect(res.status).toBe(400);
      });

      it("Should return 404 if category group doesn't exist", async () => {
        // Update using non existent group id
        const res = await updateCategoryRaw(cookie, categoryId, {
          // Fake uuid
          categoryGroupId: "3f2c1d8e-9b6a-4f1d-8c2e-7a1d9c5b0e4f",
          position: 0,
        });

        expect(res.status).toBe(404);
      });
      it("Should return 409 on name collision", async () => {
        // Create a category
        await createCategoryRaw(cookie, {
          name: "unique-name",
          categoryGroupId: categoryGroupId,
        });

        // Update category with the same name
        const res = await updateCategoryRaw(cookie, categoryId, {
          name: "unique-name",
        });
        expect(res.status).toBe(409);
      });
      it("Should return 400 when changing name and position/category group", async () => {
        // Update category with the same name
        const res = await updateCategoryRaw(cookie, categoryId, {
          name: "unique-name",
          categoryGroupId: categoryGroupId,
        });
        expect(res.status).toBe(400);
      });

      it("Should return 400 when only changing group without position", async () => {
        // Update category with the same name
        const res = await updateCategoryRaw(cookie, categoryId, {
          categoryGroupId: categoryGroupId,
        });
        expect(res.status).toBe(400);
      });
      it("Should return 400 when only providing position but no category group id", async () => {
        // Update category with the same name
        const res = await updateCategoryRaw(cookie, categoryId, {
          position: 4,
        });
        expect(res.status).toBe(400);
      });

      it("Should return 400 when updating both name and position/groupthan one field", async () => {
        const res = await updateCategoryRaw(cookie, categoryId, {
          name: "update-name",
          position: 1,
        });
        expect(res.status).toBe(400);
      });
      it("Should return 403 when moving a category into a system category group", async () => {
        // Get a system category group
        const inflowCategoryGroup = await getInflowCategoryGroup(cookie);

        // Update category using system category group id
        const res = await updateCategoryRaw(cookie, categoryId, {
          categoryGroupId: inflowCategoryGroup.id,
          position: 1,
        });

        expect(res.status).toBe(403);
      });
    });
    describe("Success", () => {
      describe("Reposition", () => {
        it("Should return entities", async () => {
          // Create another category in group
          const category = await createCategory(cookie, {
            name: "test",
            categoryGroupId,
          });

          // Reposition category
          const { body } = await updateCategoryRaw(cookie, categoryId, {
            categoryGroupId,
            position: category.position,
          });

          expect(body.updated.categories).toBeDefined();
          expect(Array.isArray(body.updated.categories)).toBe(true);

          const movedPatch = body.updated.categories.find(
            (c) => c.id === categoryId
          );

          if (!movedPatch) {
            throw new Error("Expected moved category patch not found");
          }

          expect(movedPatch).toEqual(
            expect.objectContaining({
              id: categoryId,
              categoryGroupId,
            })
          );

          expect(typeof movedPatch.position).toBe("number");
        });

        it("Should correctly reposition category within same group", async () => {
          // Create another category in group
          const category = await createCategory(cookie, {
            name: "test",
            categoryGroupId: categoryGroupId,
          });

          // Reposition category
          await updateCategoryRaw(cookie, categoryId, {
            categoryGroupId: categoryGroupId,
            position: category.position,
          });

          const updatedCategory = await getUserCategoryByIdOrThrow(
            cookie,
            categoryId
          );

          expect(updatedCategory.position).toBe(category.position);
          const categories = await getUserCategoriesByCategoryGroupId(
            cookie,
            categoryGroupId
          );
          const positions = categories.map((c) => c.position);

          expect(positions).toEqual([...positions].sort((a, b) => a - b));
        });
        it("Should correctly reposition category into a group without categories", async () => {
          // Create recieving category group with no categories
          const categoryGroup = await createCategoryGroup(cookie, {
            name: "recieving-group",
          });

          // Reposition category into other group
          const res = await updateCategoryRaw(cookie, categoryId, {
            categoryGroupId: categoryGroup.id,
            position: 0,
          });

          expect(res.status).toBe(200);
        });
        it("Should correctly reposition category into different group", async () => {
          const { category: otherCategory, categoryGroup: otherCategoryGroup } =
            await createGroupWithCategory(cookie);

          // Reposition category into other group
          await updateCategoryRaw(cookie, categoryId, {
            categoryGroupId: otherCategoryGroup.id,
            position: otherCategory.position,
          });

          const updatedCategory = await getUserCategoryByIdOrThrow(
            cookie,
            categoryId
          );

          expect(updatedCategory.position).toBe(otherCategory.position);
          expect(updatedCategory.categoryGroupId).toBe(otherCategoryGroup.id);

          const categories = await getUserCategoriesByCategoryGroupId(
            cookie,
            otherCategoryGroup.id
          );

          const positions = categories.map((c) => c.position);

          expect(positions).toEqual([...positions].sort((a, b) => a - b));
        });
      });
      describe("Rename", () => {
        it("Should return entities", async () => {
          const { body } = await updateCategoryRaw(cookie, categoryId, {
            name: "rename",
          });

          // main entity updated
          expect(body.updated.category).toBeDefined();
          expect(body.updated.category.name).toBe("rename");

          // rename should NOT affect ordering
          expect(body.updated.categories).toEqual([]);
        });
        it("Should trim whitespace when renaming", async () => {
          expect.hasAssertions();

          await updateCategoryRaw(cookie, categoryId, {
            name: "   new name   ",
          });

          const updatedCategory = await getUserCategoryByIdOrThrow(
            cookie,
            categoryId
          );

          expect(updatedCategory.name).toBe("new name");
        });
        it("Should correctly rename category", async () => {
          await updateCategoryRaw(cookie, categoryId, {
            name: "new name",
          });

          const updatedCategory = await getUserCategoryByIdOrThrow(
            cookie,
            categoryId
          );

          expect(updatedCategory.name).toBe("new name");
        });
      });
    });
  });
});
