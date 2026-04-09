import {
  getMonthsForCategories,
  getUnownedMonthId,
  updateMonthAssignments,
} from "../utils/assign";
import { login, registerUser } from "../utils/auth";
import {
  getAnotherTestCategory,
  getRTACategory,
  getTestCategory,
  getUncategorisedCategory,
} from "../utils/category";
import { getCategories } from "../utils/getData";

describe("Assign", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Assign", () => {
    describe("Error Cases", () => {
      it("Should return 400 if assigning to unowned month ", async () => {
        const unownedMonthId = await getUnownedMonthId();

        const updatedMonths = [
          {
            monthId: unownedMonthId,
            assigned: "50",
          },
        ];

        // Attempt to assign
        const res = await updateMonthAssignments(cookie, updatedMonths);

        // Expect 400
        expect(res.statusCode).toBe(400);
      });
      it("Should return 400 if assigning to non-existent month ", async () => {
        // Use a random UUID that is not in the DB
        const nonExistentMonthId = "00000000-0000-0000-0000-000000000000";

        const updatedMonths = [
          {
            monthId: nonExistentMonthId,
            assigned: "50",
          },
        ];

        const res = await updateMonthAssignments(cookie, updatedMonths);

        expect(res.statusCode).toBe(400);
      });
      it("Should return 400 if value is negative", async () => {
        const testCategory = await getTestCategory(cookie);

        const updatedMonths = [
          {
            monthId: testCategory.months[0],
            assigned: "-50",
          },
        ];

        const res = await updateMonthAssignments(cookie, updatedMonths);

        expect(res.statusCode).toBe(400);
      });
      it("Should return 400 if assigning to the same month more than once", async () => {
        const testCategory = await getTestCategory(cookie);

        const updatedMonths = [
          {
            monthId: testCategory.months[0],
            assigned: "50",
          },
          {
            monthId: testCategory.months[0],
            assigned: "10",
          },
        ];

        const res = await updateMonthAssignments(cookie, updatedMonths);

        expect(res.statusCode).toBe(400);
      });
      it("Should return 400 if months aren't the same calender date", async () => {
        const testCategory = await getTestCategory(cookie);

        const updatedMonths = [
          {
            monthId: testCategory.months[0],
            assigned: "50",
          },
          {
            monthId: testCategory.months[1],
            assigned: "10",
          },
        ];

        const res = await updateMonthAssignments(cookie, updatedMonths);

        expect(res.statusCode).toBe(400);
      });
      it.each([
        ["RTA", getRTACategory],
        ["Uncategorised", getUncategorisedCategory],
      ])(
        "should return 403 when assigning to %s category",
        async (_, getCategory) => {
          const category = await getCategory(cookie);

          const res = await updateMonthAssignments(cookie, [
            { monthId: category.months[0], assigned: "50" },
          ]);

          expect(res.statusCode).toBe(403);
        }
      );
    });
    describe("Success", () => {
      it("Should assign to a single month", async () => {
        const testCategory = await getTestCategory(cookie);
        const rtaCategory = await getRTACategory(cookie);

        const updatedMonths = [
          {
            monthId: testCategory!.months[0],
            assigned: "50",
          },
        ];

        const res = await updateMonthAssignments(cookie, updatedMonths);

        expect(res.statusCode).toBe(200);

        const body = res.body;

        // Check test category got updated
        const testCategoryMonths = body[testCategory.id];
        const rtaCategoryMonths = body[rtaCategory.id];

        expect(testCategoryMonths[0].assigned).toBe("50");
        expect(testCategoryMonths[0].available).toBe("50");
        expect(testCategoryMonths[1].available).toBe("50");

        expect(rtaCategoryMonths[0].available).toBe("-50");
        expect(rtaCategoryMonths[1].available).toBe("-50");
      });
      it("Should handle assigning 0 to a month", async () => {
        const testCategory = await getTestCategory(cookie);
        const rtaCategory = await getRTACategory(cookie);

        const updatedMonthsA = [
          {
            monthId: testCategory!.months[0],
            assigned: "50",
          },
        ];

        await updateMonthAssignments(cookie, updatedMonthsA);

        const updatedMonthsB = [
          {
            monthId: testCategory!.months[0],
            assigned: "0",
          },
        ];

        const res = await updateMonthAssignments(cookie, updatedMonthsB);

        const body = res.body;

        // Check test category got updated
        const testCategoryMonths = body[testCategory.id];
        const rtaCategoryMonths = body[rtaCategory.id];

        expect(testCategoryMonths[0].assigned).toBe("0");
        expect(testCategoryMonths[0].available).toBe("0");
        expect(testCategoryMonths[1].available).toBe("0");

        expect(rtaCategoryMonths[0].available).toBe("0");
        expect(rtaCategoryMonths[1].available).toBe("0");
      });

      it("Should be able to assign to multiple months", async () => {
        const testCategory = await getTestCategory(cookie);
        const anotherTestCategory = await getAnotherTestCategory(cookie);
        const rtaCategory = await getRTACategory(cookie);

        const updatedMonths = [
          {
            monthId: testCategory.months[0],
            assigned: "50",
          },
          {
            monthId: anotherTestCategory.months[0],
            assigned: "10",
          },
        ];

        const res = await updateMonthAssignments(cookie, updatedMonths);
        expect(res.statusCode).toBe(200);

        const { body } = res;

        const testCategoryMonths = body[testCategory.id];
        const anotherTestCategoryMonths = body[anotherTestCategory.id];
        const rtaCategoryMonths = body[rtaCategory.id];

        expect(testCategoryMonths[0].assigned).toBe("50");
        expect(testCategoryMonths[0].available).toBe("50");
        expect(testCategoryMonths[1].available).toBe("50");

        expect(anotherTestCategoryMonths[0].assigned).toBe("10");
        expect(anotherTestCategoryMonths[0].available).toBe("10");
        expect(anotherTestCategoryMonths[1].available).toBe("10");

        expect(rtaCategoryMonths[0].available).toBe("-60");
        expect(rtaCategoryMonths[1].available).toBe("-60");
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
          const testCategory = await getTestCategory(cookie);

          const categoryMonthsMap = await getMonthsForCategories(cookie, [
            testCategory.id,
          ]);

          const months = categoryMonthsMap[testCategory.id];

          expect(months.length).toBeGreaterThan(0);

          months.forEach((month) => {
            expect(month.categoryId).toBe(testCategory.id);
          });
        });
        it("Should fetch all months for multiple categories", async () => {
          const { categories } = await getCategories(cookie);

          const ids = Object.values(categories)
            .slice(0, 2)
            .map((c) => c.id);

          const categoryMonthsMap = await getMonthsForCategories(cookie, ids);

          ids.forEach((categoryId) => {
            const months = categoryMonthsMap[categoryId];

            expect(months.length).toBeGreaterThan(0);

            months.forEach((m) => {
              expect(m.categoryId).toBe(categoryId);
            });
          });
        });
      });
    });
  });
});
