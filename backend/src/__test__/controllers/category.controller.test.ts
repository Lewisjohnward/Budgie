// edit
// test whitespace trim
// test user not moving category to protected
// test position edit correctly (other cats updated too)
// test updated category is returned
// 201 response
// accepts either name or cat id but not both (maybe)

import {
  getMonthsByCategoryId,
  getUserCategories,
  getUserCategoryByName,
} from "../utils/appSnapshot";
import { login, register, registerUser } from "../utils/auth";
import { createCategory, createCategoryRaw } from "../utils/category";
import { createCategoryGroup } from "../utils/categoryGroup";

describe("Category", () => {
  let cookie: string;
  let testCategoryGroupId: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    // Create a category group
    const categoryGroup = await createCategoryGroup(cookie, {
      name: "test-group",
    });
    testCategoryGroupId = categoryGroup.id;
  });
  describe("Create", () => {
    describe("Error Cases", () => {
      it("Should return 401 on unauthenticated requests ", async () => {
        const res = await createCategoryRaw("invalid-cookie", {
          name: "test-category",
          categoryGroupId: "invalid-group-id",
        });

        expect(res.status).toBe(401);
      });
      it("Should return 404 if user doesn't own category group", async () => {
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

        // Create category using unowned category group
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: otherUserCategoryGroup.id,
        });
        expect(res.statusCode).toBe(404);
      });
      it("Should return 404 if category group doesn't exist", async () => {
        // Create a category with non existent id
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          // Fake uuid
          categoryGroupId: "3f2c1d8e-9b6a-4f1d-8c2e-7a1d9c5b0e4f",
        });

        console.log("res:", res);
        expect(res.statusCode).toBe(404);
      });
      it("Should return 409 on name collision", async () => {
        // Create a test category
        await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });

        // Create another category with the same name
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });
        expect(res.statusCode).toBe(409);
      });
    });
    describe("Success", () => {
      it("Should return 201 on creation", async () => {
        // Create category
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });

        expect(res.statusCode).toBe(201);
      });
      it("Should create and persist category", async () => {
        await createCategory(cookie, {
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });

        const createdCategory = getUserCategoryByName(cookie, "test-category");

        expect(createdCategory).toBeDefined();

        expect(createdCategory).toMatchObject({
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });
      });
      it("Should return category dto", async () => {
        // Create category
        const dto = await createCategory(cookie, {
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });

        expect(dto.created.category).toMatchObject({
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });
        expect(dto.created.category.id).toBeDefined();

        expect(dto.created.months).toBeDefined();
        expect(Object.keys(dto.created.months).length).toBeGreaterThan(0);
      });
      it("Should assign next index", async () => {
        await createCategory(cookie, {
          name: "category-1",
          categoryGroupId: testCategoryGroupId,
        });

        const dto = await createCategory(cookie, {
          name: "category-2",
          categoryGroupId: testCategoryGroupId,
        });

        expect(dto.created.category.position).toBe(1);
      });
      it("Should trim whitespace", async () => {
        const dto = await createCategory(cookie, {
          name: "   test-category   ",
          categoryGroupId: testCategoryGroupId,
        });

        expect(dto.created.category.name).toBe("test-category");
      });
      describe("Side Effects", () => {
        describe("Months", () => {
          it("Should create new months for category initialised to 0", async () => {
            const dto = await createCategory(cookie, {
              name: "test-category",
              categoryGroupId: testCategoryGroupId,
            });

            const createdMonths = await getMonthsByCategoryId(
              cookie,
              dto.created.category.id
            );

            expect(createdMonths.length).toBeGreaterThan(0);
            expect(createdMonths).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  activity: 0,
                  assigned: 0,
                  available: 0,
                }),
              ])
            );
          });
        });
      });
    });
  });
});
