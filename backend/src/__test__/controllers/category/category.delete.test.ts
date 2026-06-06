import { getInflowCategoryGroup } from "../../utils/appSnapshot";
import { registerUser, login, register } from "../../utils/auth";
import {
  createCategoryRaw,
  createCategory,
  updateCategoryRaw,
  deleteCategoryRaw,
} from "../../utils/category";
import { createCategoryGroup } from "../../utils/categoryGroup";

describe("Category", () => {
  let cookie: string;
  let testCategoryGroupId: string;
  let testCategoryId: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    // Create a category group
    const categoryGroup = await createCategoryGroup(cookie, {
      name: "test-group",
    });
    testCategoryGroupId = categoryGroup.id;
    // Create a category
    const createCategoryDto = await createCategory(cookie, {
      name: "test-category",
      categoryGroupId: testCategoryGroupId,
    });
    testCategoryId = createCategoryDto.created.category.id;
  });
  describe("Delete", () => {
    describe("Error Cases", () => {
      it("Should return 401 on unauthenticated requests ", async () => {
        const res = await deleteCategoryRaw("invalid-cookie", "invalid-id");

        expect(res.status).toBe(401);
      });
      // it("Should return 404 if user doesnt own inheriting category")
      it("Should return 404 if user doesn't own category", async () => {
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

        // Create category for other user
        const otherUserCategory = await createCategory(otherUserCookie, {
          name: "other-user-category-group",
          categoryGroupId: otherUserCategoryGroup.id,
        });

        // Delete category using unowned category group
        const res = await deleteCategoryRaw(
          cookie,
          otherUserCategory.created.category.id
        );
        expect(res.statusCode).toBe(404);
      });
      it.skip("Should return 404 if category group doesn't exist", async () => {
        // Create a category with non existent id
        const res = await updateCategoryRaw(cookie, testCategoryId, {
          name: "test-category",
          // Fake uuid
          categoryGroupId: "3f2c1d8e-9b6a-4f1d-8c2e-7a1d9c5b0e4f",
        });

        expect(res.statusCode).toBe(404);
      });
      it("Should return 409 on name collision", async () => {
        // Create a category
        await createCategoryRaw(cookie, {
          name: "unique-name",
          categoryGroupId: testCategoryGroupId,
        });

        // Update category with the same name
        const res = await updateCategoryRaw(cookie, testCategoryId, {
          name: "unique-name",
          categoryGroupId: testCategoryGroupId,
        });
        expect(res.statusCode).toBe(409);
      });
      it("Should return 409 when updating more than one field", async () => {
        const res = await updateCategoryRaw(cookie, testCategoryId, {
          name: "update-name",
          position: 1,
        });
        expect(res.statusCode).toBe(409);
      });
      it("Should return 403 when moving a category into a system category group", async () => {
        // Get a system category group
        const inflowCategoryGroup = await getInflowCategoryGroup(cookie);
        console.log("inflowCategoryGroup:", inflowCategoryGroup);

        // Update category using system category group id
        const res = await updateCategoryRaw(cookie, testCategoryId, {
          categoryGroupId: inflowCategoryGroup.id,
        });

        expect(res.statusCode).toBe(403);
      });
    });
    describe("Success", () => {});
  });
});
