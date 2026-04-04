import { getMonthsForCategories } from "../utils/assign";
import { login, registerUser } from "../utils/auth";
import { getCategories } from "../utils/getData";

describe("Assign", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Assign", () => {
    describe("Error Cases", () => {
      it.skip("Should return 400 if assigning to unowned month ", async () => {
        expect.hasAssertions();
      });
      it.skip("Should return 400 if assigning to non-existent month ", async () => {
        expect.hasAssertions();
      });
    });
    describe("Success", () => {
      it.skip("Should be able to assign to multiple months", async () => {
        expect.hasAssertions();
      });
    });
  });

  describe("Months", () => {
    describe("Get", () => {
      describe("Error Cases", () => {
        it("Should return 400 if no categoryIds provided", async () => {
          try {
            await getMonthsForCategories(cookie, []);
          } catch (err: any) {
            expect(err.status).toBe(400);
          }
        });
        it("Should return 400 if getting months for unowned category", async () => {
          // A fake category ID that doesn't belong to user
          const fakeCategoryId = "00000000-0000-0000-0000-000000000000";

          try {
            await getMonthsForCategories(cookie, [fakeCategoryId]);
          } catch (err: any) {
            expect(err.status).toBe(404);
          }
        });

        it("Should return 400 if getting months for non-existent category", async () => {
          // A random UUID that doesn’t exist in the database
          const nonExistentId = "11111111-1111-1111-1111-111111111111";

          try {
            await getMonthsForCategories(cookie, [nonExistentId]);
          } catch (err: any) {
            expect(err.status).toBe(404);
          }
        });
      });
      describe("Success", () => {
        it("Should fetch all months for a single category", async () => {
          const { categories } = await getCategories(cookie);

          const categoriesArray = Object.values(categories);

          const category = categoriesArray[0];

          const monthsForCategories = await getMonthsForCategories(cookie, [
            category.id,
          ]);

          expect(monthsForCategories.length).toBeGreaterThan(0);

          monthsForCategories.forEach((month) => {
            expect(month.categoryId).toBe(category.id);
          });
        });
        it("Should fetch all months for multiple categories", async () => {
          const { categories } = await getCategories(cookie);
          const ids = Object.values(categories)
            .slice(0, 2)
            .map((c) => c.id);

          const months = await getMonthsForCategories(cookie, ids);
          expect(months.length).toBeGreaterThan(0);
          months.forEach((m) => expect(ids).toContain(m.categoryId));
        });
      });
    });
  });
});
