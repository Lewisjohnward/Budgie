import {
  getUserCategoryByName,
  getMonthsByCategoryId,
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
          categoryGroupId: testCategoryGroupId,
        });

        // Create another category with the same name
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });
        expect(res.status).toBe(409);
      });
    });
    describe("Success", () => {
      it("Should return 201 on creation", async () => {
        // Create category
        const res = await createCategoryRaw(cookie, {
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });

        expect(res.status).toBe(201);
      });
      it("Should create and persist category", async () => {
        await createCategory(cookie, {
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });

        const createdCategory = await getUserCategoryByName(
          cookie,
          "test-category"
        );

        expect(createdCategory).toBeDefined();

        expect(createdCategory).toMatchObject({
          name: "test-category",
          categoryGroupId: testCategoryGroupId,
        });
      });
      it("Should return created entities", async () => {
        // Create category
        const { body: dto } = await createCategoryRaw(cookie, {
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
      it("Should assign the next available position", async () => {
        const categoryA = await createCategory(cookie, {
          name: "category-1",
          categoryGroupId: testCategoryGroupId,
        });

        const categoryB = await createCategory(cookie, {
          name: "category-2",
          categoryGroupId: testCategoryGroupId,
        });

        expect(categoryA.position).toBe(0);
        expect(categoryB.position).toBe(1);
      });
      it("Should trim whitespace", async () => {
        const { body: dto } = await createCategoryRaw(cookie, {
          name: "   test-category   ",
          categoryGroupId: testCategoryGroupId,
        });

        expect(dto.created.category.name).toBe("test-category");
      });
      describe("Side Effects", () => {
        describe("Months", () => {
          it("Should create new months for category initialised to 0", async () => {
            const { body: dto } = await createCategoryRaw(cookie, {
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
          it("Should create months with same date set as existing categories", async () => {
            // Create first category to establish baseline months
            const { body: first } = await createCategoryRaw(cookie, {
              name: "category-1",
              categoryGroupId: testCategoryGroupId,
            });

            const baselineMonths = await getMonthsByCategoryId(
              cookie,
              first.created.category.id
            );

            const baselineDates = baselineMonths.map((m) => m.month).sort();

            // Create second category
            const { body: second } = await createCategoryRaw(cookie, {
              name: "category-2",
              categoryGroupId: testCategoryGroupId,
            });

            const newCategoryMonths = await getMonthsByCategoryId(
              cookie,
              second.created.category.id
            );

            const newDates = newCategoryMonths.map((m) => m.month).sort();

            // Check same “timeline”
            expect(newDates).toEqual(baselineDates);

            // Check All months initialized correctly
            expect(newCategoryMonths.every((m) => m.activity === 0)).toBe(true);
            expect(newCategoryMonths.every((m) => m.assigned === 0)).toBe(true);
            expect(newCategoryMonths.every((m) => m.available === 0)).toBe(
              true
            );
          });
        });
      });
    });
  });
});
