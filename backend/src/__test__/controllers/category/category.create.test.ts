import {
  getMonthsByCategoryId,
  getUserCategoryById,
} from "../../utils/appSnapshot";
import { registerUser, login, register } from "../../utils/auth";
import { createCategoryGroup } from "../../utils/category-group/categoryGroup.create";
import {
  createCategory,
  createCategoryRaw,
} from "../../utils/category/category.create";
import { createGroupWithCategory } from "../../utils/scenarios/createGroupWithCategory";

describe("Category", () => {
  let cookie: string;
  let categoryGroupId: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    // Create a category group
    const categoryGroup = await createCategoryGroup(cookie, {
      name: "test-group",
    });
    categoryGroupId = categoryGroup.id;
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

        const { categoryGroup: notOwnedCategoryGroup } =
          await createGroupWithCategory(otherUserCookie);

        // Create category using unowned category group
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: notOwnedCategoryGroup.id,
        });
        expect(res.status).toBe(404);
      });

      it("Should return 404 if category group doesn't exist", async () => {
        // Create a category with non existent id
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          // Fake uuid
          categoryGroupId: "3f2c1d8e-9b6a-4f1d-8c2e-7a1d9c5b0e4f",
        });

        expect(res.status).toBe(404);
      });

      it("Should return 409 on name collision", async () => {
        // Create a test category
        await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: categoryGroupId,
        });

        // Create another category with the same name
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: categoryGroupId,
        });
        expect(res.status).toBe(409);
      });
    });

    describe("Success", () => {
      it("Should return 201 on creation", async () => {
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: categoryGroupId,
        });

        expect(res.status).toBe(201);
      });

      it("Should create and persist category", async () => {
        const { id } = await createCategory(cookie, {
          name: "test-category",
          categoryGroupId: categoryGroupId,
        });

        const category = await getUserCategoryById(cookie, id);

        expect(category).toBeDefined();
        expect(category).toMatchObject({
          name: "test-category",
          categoryGroupId: categoryGroupId,
        });
      });

      it("Should return created entities", async () => {
        const { body: dto } = await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: categoryGroupId,
        });

        expect(dto.created.category).toMatchObject({
          name: "test-category",
          categoryGroupId: categoryGroupId,
        });
        expect(dto.created.category.id).toBeDefined();

        expect(dto.created.months).toBeDefined();
        expect(Object.keys(dto.created.months).length).toBeGreaterThan(0);
      });

      it("Should assign the next available position", async () => {
        const categoryA = await createCategory(cookie, {
          name: "category-1",
          categoryGroupId: categoryGroupId,
        });

        const categoryB = await createCategory(cookie, {
          name: "category-2",
          categoryGroupId: categoryGroupId,
        });

        expect(categoryA.position).toBe(0);
        expect(categoryB.position).toBe(1);
      });

      it("Should trim whitespace", async () => {
        const category = await createCategory(cookie, {
          name: "   test-category   ",
          categoryGroupId: categoryGroupId,
        });

        expect(category.name).toBe("test-category");
      });

      it("Should allow identical names across separate category groups without throwing an error", async () => {
        const duplicateTargetName = "Groceries";

        // Group 1 setup
        const groupA = await createCategoryGroup(cookie, { name: "Group A" });
        await createCategory(cookie, {
          name: duplicateTargetName,
          categoryGroupId: groupA.id,
        });

        // Group 2 setup
        const groupB = await createCategoryGroup(cookie, { name: "Group B" });

        const res = await createCategoryRaw(cookie, {
          name: duplicateTargetName,
          categoryGroupId: groupB.id,
        });

        expect(res.status).toBe(201);
      });

      describe("Side Effects", () => {
        describe("Months", () => {
          it("Should return and persist initial zero-value months matching the existing budget timeline", async () => {
            // Create a timeline baseline by creating an initial category
            const firstCategory = await createCategory(cookie, {
              name: "baseline-category",
              categoryGroupId: categoryGroupId,
            });
            const baselineMonths = await getMonthsByCategoryId(
              cookie,
              firstCategory.id
            );
            const baselineDates = baselineMonths.map((m) => m.month).sort();

            // Create target entity
            const res = await createCategoryRaw(cookie, {
              name: "target-category",
              categoryGroupId: categoryGroupId,
            });

            expect(res.status).toBe(201);
            const apiMonths = Object.values(res.body.created.months);
            const expectedMonthShape = {
              activity: 0,
              assigned: 0,
              available: 0,
            };

            // Validate the API response engine outputs what we expect
            expect(apiMonths.length).toBeGreaterThan(0);
            expect(apiMonths.map((m) => m.month).sort()).toEqual(baselineDates);
            apiMonths.forEach((month) => {
              expect(month).toMatchObject(expectedMonthShape);
            });

            // Validate persisted in database
            const dbMonths = await getMonthsByCategoryId(
              cookie,
              res.body.created.category.id
            );

            expect(dbMonths.map((m) => m.month).sort()).toEqual(baselineDates);
            dbMonths.forEach((month) => {
              expect(month).toMatchObject(expectedMonthShape);
            });
          });
        });
      });
    });
  });
});
