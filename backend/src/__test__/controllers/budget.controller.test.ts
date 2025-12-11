import request from "supertest";
import app from "../../app";
import { NormalisedCategories } from "../../features/budget/category/category.types";
import { getAccounts, getCategories } from "../utils/getData";
import { createTestAccount } from "../utils/createTestAccount";
import { addAccount, addTransaction } from "../utils/transaction";
import { login, registerUser } from "../utils/auth";

describe("Budget", () => {
  it.todo("Should prevent users accessing/updating other users data");

  describe("Categories", () => {
    let cookie: string;

    beforeEach(async () => {
      await registerUser();
      cookie = await login();
    });
    describe("Delete category", () => {
      it.todo("should recalculate position of other categories");
      it.todo("should throw error if user doesn't own category");
      it.todo("should throw error if user doesn't own inheriting category");
      it.todo("should throw error if no inheriting category provided");
      it.todo("should throw error if inherting category is protected category");
      it.todo(
        "should correctly update rta when deleting category with assigned"
      );
      it.todo("should throw error if when deleting protected category");
      it.todo("should transfer transactions to inheriting group");
      it.todo("should throw error if no inheriting category provided");
      it.todo("should throw error if inheriting category is protected");
      it.todo("should throw error if inheriting category is not owned by user");
    });
    it.todo("Should handle delete categories");
    describe("Edit category", () => {
      it.todo("should prevent name collision");
      it.todo("should maintain position when updating");
      it.todo("should throw error if user doesn't own category");
      it.todo("should throw error if name conflict within category group");
      it.todo("should not allow adding to protected category groups");
      it.todo("should correctly update a category");
    });

    describe("Create category", () => {
      it.todo("should prevent name collision");
      it.todo("Should prevent user adding a category without category group");
      it.todo(
        "Should prevent user from adding a category to a category group they don't own"
      );
      it.todo("Should correctly assign position when categoryGroup empty");

      it.todo(
        "Should correctly assign position when categoryGroup has other categories"
      );
      it("Should only add a single category when adding", async () => {
        const { categories } = await getCategories(cookie);

        const testCategory = Object.values(categories).filter(
          (cat) => cat.name === "test category"
        );
        expect(testCategory.length).toBe(1);
      });
      it("Should prevent user from adding category to Inflow group", async () => {
        const { categoryGroups } = await getCategories(cookie);

        const inflowCategoryGroup = Object.values(categoryGroups).find(
          (categoryGroup) => categoryGroup.name === "Inflow"
        );

        if (!inflowCategoryGroup)
          throw new Error("Inflow category group not found");

        const testCategory = {
          name: "inflow test category",
          categoryGroupId: inflowCategoryGroup.id,
        };

        const addCategoryResponse = await request(app)
          .post("/budget/category")
          .send(testCategory)
          .set("Authorization", `Bearer ${cookie}`);

        expect(addCategoryResponse.status).toBe(403);

        const categoriesResponseAfter = await request(app)
          .get("/budget/category")
          .set("Authorization", `Bearer ${cookie}`);

        const responseBodyAfter =
          categoriesResponseAfter.body as NormalisedCategories;

        expect(
          Object.values(responseBodyAfter.categories).some(
            (cat) => cat.name === testCategory.name
          )
        ).toBe(false);
      });

      it("Should prevent user from adding categories to Uncategorised group", async () => {
        const { categoryGroups } = await getCategories(cookie);

        const uncategorisedCategoryGroup = Object.values(categoryGroups).find(
          (categoryGroup) => categoryGroup.name === "Uncategorised"
        );

        if (!uncategorisedCategoryGroup)
          throw new Error("Uncategorised category group not found");

        const testCategory = {
          name: "uncategorised test category",
          categoryGroupId: uncategorisedCategoryGroup.id,
        };

        const addCategoryResponse = await request(app)
          .post("/budget/category")
          .send(testCategory)
          .set("Authorization", `Bearer ${cookie}`);

        expect(addCategoryResponse.status).toBe(403);

        const categoriesResponseAfter = await request(app)
          .get("/budget/category")
          .set("Authorization", `Bearer ${cookie}`);

        const responseBodyAfter =
          categoriesResponseAfter.body as NormalisedCategories;

        expect(
          Object.values(responseBodyAfter.categories).some(
            (cat) => cat.name === testCategory.name
          )
        ).toBe(false);
      });

      it("Should prevent user from adding a category with a duplicate name", async () => {
        const { categoryGroups, categories } = await getCategories(cookie);

        const testCategoryGroup = Object.values(categoryGroups).find(
          (cg) => cg.name === "test category group"
        );

        if (!testCategoryGroup)
          throw new Error("Unable to find test category group");

        const testCategory = {
          categoryGroupId: testCategoryGroup.id,
          name: "test category",
        };

        const existingCategory = Object.values(categories).find(
          (cat) =>
            cat.name === testCategory.name &&
            cat.categoryGroupId === testCategory.categoryGroupId
        );

        if (!existingCategory) {
          await request(app)
            .post("/budget/category")
            .set("Authorization", `Bearer ${cookie}`)
            .send(testCategory)
            .expect(201);
        }

        const duplicateCategoryRes = await request(app)
          .post("/budget/category")
          .set("Authorization", `Bearer ${cookie}`)
          .send(testCategory);

        const { categories: updatedCategories } = await getCategories(cookie);

        expect(duplicateCategoryRes.status).toBe(409);
        expect(
          Object.values(updatedCategories).filter(
            (cat) =>
              cat.name === testCategory.name &&
              cat.categoryGroupId === testCategory.categoryGroupId
          ).length
        ).toBe(1);
      });

      it.todo(
        "Should prevent user from adding a category group with a duplicate name"
      );
    });
  });

  describe("Category groups", () => {
    let cookie: string;

    beforeEach(async () => {
      await registerUser();
      cookie = await login();
    });
    describe("create", () => {
      it.todo("should prevent name collision");
      it.todo("should create a category group");
      it.todo("should correctly update position");
    });

    describe("edit", () => {
      it.todo("should prevent name collision");
      it.todo("should prevent user from editing protected categories");
      it.todo("should update name");
      it.todo("should update position");
      it.todo("should prevent user editing non existent / other users groups");
    });

    describe("delete", () => {
      it.todo("should delete category group");
      it.todo("should prevent user from deleting protected categories");
      it.todo("should update name");
      it.todo("should transfer to inherting category");
      it.todo("should prevent user deleting non existent / other users groups");
    });
  });

  describe("Transaction", () => {
    let cookie: string;

    beforeEach(async () => {
      await registerUser();
      cookie = await login();
    });
    describe("Adding transaction", () => {
      it.todo(
        "should throw error if user tries adding to account not owned by themselves"
      );
    });

    describe.skip("Deleting", () => {});
    it("When adding a transaction without logging in returns 401", async () => {
      const testTransaction = {
        outflow: 10,
      };

      const res = await request(app)
        .post("/budget/transaction")
        .send(testTransaction);

      expect(res.status).toBe(401);
    });

    it.skip("should allow transactions added at 1am", async () => {
      const account = await createTestAccount(cookie);

      jest.useFakeTimers();
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      jest.setSystemTime(fixedDate);

      const transactionDate = new Date(2025, 6, 15, 1, 0, 0);

      const addTransactionRes = await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          accountId: account.id,
          outflow: "10",
          date: transactionDate,
        })
        .expect(200);

      jest.useRealTimers();
    });
    it.todo(
      "should throw error if category id provided doesn't exist/ not owned by user"
    );

    it.skip("When adding a transaction with no account, returns 400", async () => {});

    it.todo("Should return error when user doesn't own category");

    it("When adding a transaction with no category, transaction is assigned to Uncategorised", async () => {
      const account = await createTestAccount(cookie);

      const addTransactionRes = await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          accountId: account.id,
          outflow: "10",
        });

      const { transactions, categories } = await getAccounts(cookie);

      const transaction = Object.values(transactions).find(
        (t) => t.outflow === 10
      );

      if (!transaction) throw new Error("Unable to find test transaction");

      const uncategorisedCategory = Object.values(categories).find(
        (c) => c.name === "Uncategorised Transactions"
      );

      if (!uncategorisedCategory)
        throw new Error("Unable to find uncategorised category");

      expect(transaction.categoryId).toBe(uncategorisedCategory.id);
    });

    it.todo("Should correctly duplicate transactions");
    it("should fail when adding a transaction without inflow or outflow", async () => {
      const account = await createTestAccount(cookie);

      const testTransaction = {
        accountId: account.id,
        memo: "test tx",
      };

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testTransaction)
        .expect(400);
    });
  });

  describe("Ready to assign", () => {});

  describe("Months", () => {
    describe("assigning", () => {
      let cookie: string;

      beforeEach(async () => {
        await registerUser();
        cookie = await login();
      });
      it("should prevent user from assigning to uncategorised category month", async () => {
        const { categories } = await getCategories(cookie);

        const uncategorisedCategory = Object.values(categories).find(
          (c) => c.name === "Uncategorised Transactions"
        );

        if (!uncategorisedCategory)
          throw new Error("Unable to find uncategorised category");

        const res = await request(app)
          .patch("/budget/assign")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            assigned: "10",
            monthId: uncategorisedCategory.months[0],
          });

        expect(res.status).toBe(403);
      });

      it.todo("Should correctly update assigned for category month");
      it.todo("should prevent user from accessing another users months");
      it.todo("should prevent user from assigning to rta category");

      it("should update available/activity when deleting an inflow transaction", async () => {
        const testTransaction = {
          inflow: "10",
          memo: "test",
        };
        const testAccountData = {
          name: "test account",
          type: "BANK",
          balance: 0,
        };
        const resAddAccount = await request(app)
          .post("/budget/account")
          .set("Authorization", `Bearer ${cookie}`)
          .send(testAccountData)
          .expect(200);

        const { accounts } = await getAccounts(cookie);
        const { categories } = await getCategories(cookie);

        const testCategory = Object.values(categories).find(
          (cat) => cat.name === "test category"
        );
        if (!testCategory) throw new Error("No category found");

        const testAccount = Object.values(accounts).find(
          (account) => account.name == "test account"
        );

        if (!testAccount) throw new Error("No account found");

        const { id: accountId } = testAccount;

        const resAddTransaction = await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            ...testTransaction,
            categoryId: testCategory.id,
            accountId,
          })
          .expect(200);

        const { transactions } = await getAccounts(cookie);

        const transaction = Object.values(transactions).find(
          (t) => t.memo === "test"
        );

        if (!transaction) throw new Error("Unable to find test transaction");

        await request(app)
          .delete("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({ transactionIds: [transaction.id] })
          .expect(200);

        const { months } = await getCategories(cookie);

        const testMonths = Object.values(months).filter(
          (month) => month.categoryId === testCategory.id
        );

        expect(testMonths[0].activity).toBe(0);
        expect(testMonths[0].available).toBe(0);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(0);
      });
    });
    describe("Login in future", () => {
      let cookie: string;

      beforeEach(async () => {
        jest.useFakeTimers({
          doNotFake: ["nextTick", "setImmediate", "setTimeout", "setInterval"],
        });
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it("should create a month when logging in after a month gap", async () => {
        // create account and make sure there is 2 months
        jest.setSystemTime(new Date("2025-05-01"));
        await registerUser();
        cookie = await login();

        const { categories: initialCategories, months: initialMonths } =
          await getCategories(cookie);

        const initialTestCategory = Object.values(initialCategories).find(
          (cat) => cat.name === "test category"
        );
        expect(initialTestCategory).toBeTruthy();
        if (!initialTestCategory) throw new Error("testCategory is Undefined");

        const initialTestCategoryMonths = initialTestCategory.months.map(
          (monthId) => initialMonths[monthId]
        );

        const initialAllCategoriesHaveCorrectMonths = Object.values(
          initialCategories
        ).every((category) => category.months.length === 2);
        expect(initialAllCategoriesHaveCorrectMonths).toBe(true);
        expect(initialTestCategoryMonths.length).toBe(2);

        const initialMonthDates = initialTestCategoryMonths.map(
          (m) => new Date(m.month)
        );
        expect(initialMonthDates).toEqual([
          new Date("2025-05-01"),
          new Date("2025-06-01"),
        ]);

        // login and make sure there is 3 months
        jest.setSystemTime(new Date("2025-07-01"));
        cookie = await login();
        const { categories: updatedCategories, months: updatedMonths } =
          await getCategories(cookie);
        const updatedTestCategory = Object.values(updatedCategories).find(
          (cat) => cat.name === "test category"
        );
        expect(updatedTestCategory).toBeTruthy();
        if (!updatedTestCategory) throw new Error("testCategory is Undefined");

        const updatedTestCategoryMonths = updatedTestCategory.months.map(
          (monthId) => updatedMonths[monthId]
        );

        const updatedAllCategoriesHaveCorrectMonths = Object.values(
          updatedCategories
        ).every((category) => category.months.length === 3);
        expect(updatedAllCategoriesHaveCorrectMonths).toBe(true);
        expect(updatedTestCategoryMonths.length).toBe(3);

        const updatedMonthDates = updatedTestCategoryMonths.map(
          (m) => new Date(m.month)
        );
        expect(updatedMonthDates).toEqual([
          new Date("2025-05-01"),
          new Date("2025-06-01"),
          new Date("2025-07-01"),
        ]);
      });

      it("should create 12 missing months when logging in after a year gap", async () => {
        // create account and make sure there is 2 months
        jest.setSystemTime(new Date("2025-05-01"));
        await registerUser();
        cookie = await login();

        const { categories: initialCategories, months: initialMonths } =
          await getCategories(cookie);

        const initialTestCategory = Object.values(initialCategories).find(
          (cat) => cat.name === "test category"
        );
        expect(initialTestCategory).toBeTruthy();
        if (!initialTestCategory) throw new Error("testCategory is Undefined");

        const initialTestCategoryMonths = initialTestCategory.months.map(
          (monthId) => initialMonths[monthId]
        );

        const initialAllCategoriesHaveCorrectMonths = Object.values(
          initialCategories
        ).every((category) => category.months.length === 2);
        expect(initialAllCategoriesHaveCorrectMonths).toBe(true);
        expect(initialTestCategoryMonths.length).toBe(2);

        const initialMonthDates = initialTestCategoryMonths.map(
          (m) => new Date(m.month)
        );
        expect(initialMonthDates).toEqual([
          new Date("2025-05-01"),
          new Date("2025-06-01"),
        ]);

        // login and make sure there is 12 months
        jest.setSystemTime(new Date("2026-05-01"));
        cookie = await login();
        const { categories: updatedCategories, months: updatedMonths } =
          await getCategories(cookie);
        const updatedTestCategory = Object.values(updatedCategories).find(
          (cat) => cat.name === "test category"
        );
        expect(updatedTestCategory).toBeTruthy();
        if (!updatedTestCategory) throw new Error("testCategory is Undefined");

        const updatedTestCategoryMonths = updatedTestCategory.months.map(
          (monthId) => updatedMonths[monthId]
        );

        const updatedAllCategoriesHaveCorrectMonths = Object.values(
          updatedCategories
        ).every((category) => category.months.length === 13);
        expect(updatedAllCategoriesHaveCorrectMonths).toBe(true);
        expect(updatedTestCategoryMonths.length).toBe(13);

        const updatedMonthDates = updatedTestCategoryMonths.map(
          (m) => new Date(m.month)
        );
        expect(updatedMonthDates).toEqual([
          new Date("2025-05-01"),
          new Date("2025-06-01"),
          new Date("2025-07-01"),
          new Date("2025-08-01"),
          new Date("2025-09-01"),
          new Date("2025-10-01"),
          new Date("2025-11-01"),
          new Date("2025-12-01"),
          new Date("2026-01-01"),
          new Date("2026-02-01"),
          new Date("2026-03-01"),
          new Date("2026-04-01"),
          new Date("2026-05-01"),
        ]);
      });

      it("should not have a daylight saving issue, try 31/03/2025", async () => {
        // create account and make sure there is 2 months
        jest.setSystemTime(new Date("2025-01-01"));
        await registerUser();
        cookie = await login();

        const { categories: initialCategories, months: initialMonths } =
          await getCategories(cookie);

        const initialTestCategory = Object.values(initialCategories).find(
          (cat) => cat.name === "test category"
        );
        expect(initialTestCategory).toBeTruthy();
        if (!initialTestCategory) throw new Error("testCategory is Undefined");

        const initialTestCategoryMonths = initialTestCategory.months.map(
          (monthId) => initialMonths[monthId]
        );

        const initialAllCategoriesHaveCorrectMonths = Object.values(
          initialCategories
        ).every((category) => category.months.length === 2);
        expect(initialAllCategoriesHaveCorrectMonths).toBe(true);
        expect(initialTestCategoryMonths.length).toBe(2);

        const initialMonthDates = initialTestCategoryMonths.map(
          (m) => new Date(m.month)
        );
        expect(initialMonthDates).toEqual([
          new Date("2025-01-01"),
          new Date("2025-02-01"),
        ]);

        // login and make sure there is 3 months
        jest.setSystemTime(new Date("2025-03-31"));
        cookie = await login();
        const { categories: updatedCategories, months: updatedMonths } =
          await getCategories(cookie);
        const updatedTestCategory = Object.values(updatedCategories).find(
          (cat) => cat.name === "test category"
        );
        expect(updatedTestCategory).toBeTruthy();
        if (!updatedTestCategory) throw new Error("testCategory is Undefined");

        const updatedTestCategoryMonths = updatedTestCategory.months.map(
          (monthId) => updatedMonths[monthId]
        );

        const updatedAllCategoriesHaveCorrectMonths = Object.values(
          updatedCategories
        ).every((category) => category.months.length === 3);
        expect(updatedAllCategoriesHaveCorrectMonths).toBe(true);
        expect(updatedTestCategoryMonths.length).toBe(3);

        const updatedMonthDates = updatedTestCategoryMonths.map(
          (m) => new Date(m.month)
        );
        expect(updatedMonthDates).toEqual([
          new Date("2025-01-01"),
          new Date("2025-02-01"),
          new Date("2025-03-01"),
        ]);
      });

      it("should not have a daylight saving issue during UK October DST transition (fall back)", async () => {
        // UK DST ends on last Sunday in October (clocks fall back from BST to GMT)
        // Register in September, then login during/after October DST transition

        // create account and make sure there is 2 months
        jest.setSystemTime(new Date("2025-08-01"));
        await registerUser();
        cookie = await login();

        const { categories: initialCategories, months: initialMonths } =
          await getCategories(cookie);

        const initialTestCategory = Object.values(initialCategories).find(
          (cat) => cat.name === "test category"
        );
        expect(initialTestCategory).toBeTruthy();
        if (!initialTestCategory) throw new Error("testCategory is Undefined");

        const initialTestCategoryMonths = initialTestCategory.months.map(
          (monthId) => initialMonths[monthId]
        );

        const initialAllCategoriesHaveCorrectMonths = Object.values(
          initialCategories
        ).every((category) => category.months.length === 2);
        expect(initialAllCategoriesHaveCorrectMonths).toBe(true);
        expect(initialTestCategoryMonths.length).toBe(2);

        const initialMonthDates = initialTestCategoryMonths.map(
          (m) => new Date(m.month)
        );
        expect(initialMonthDates).toEqual([
          new Date("2025-08-01"),
          new Date("2025-09-01"),
        ]);

        // Login after October DST transition (clocks fall back)
        // October 26, 2025 is the last Sunday in October when UK DST ends
        jest.setSystemTime(new Date("2025-10-28"));
        cookie = await login();

        const { categories: updatedCategories, months: updatedMonths } =
          await getCategories(cookie);
        const updatedTestCategory = Object.values(updatedCategories).find(
          (cat) => cat.name === "test category"
        );
        expect(updatedTestCategory).toBeTruthy();
        if (!updatedTestCategory) throw new Error("testCategory is Undefined");

        const updatedTestCategoryMonths = updatedTestCategory.months.map(
          (monthId) => updatedMonths[monthId]
        );

        const updatedAllCategoriesHaveCorrectMonths = Object.values(
          updatedCategories
        ).every((category) => category.months.length === 3);

        expect(updatedAllCategoriesHaveCorrectMonths).toBe(true);
        expect(updatedTestCategoryMonths.length).toBe(3);

        const updatedMonthDates = updatedTestCategoryMonths.map(
          (m) => new Date(m.month)
        );
        expect(updatedMonthDates).toEqual([
          new Date("2025-08-01"),
          new Date("2025-09-01"),
          new Date("2025-10-01"),
        ]);
      });

      describe("Balance Carry-over Logic", () => {
        let cookie: string;
        let initialCategories: any;
        let testAccount: any;
        let readyToAssignCategory: any;
        let testCategory: any;

        beforeEach(async () => {
          jest.setSystemTime(new Date("2025-05-01T00:00:00.000Z"));
          await registerUser();
          cookie = await login();

          const { categories } = await getCategories(cookie);
          initialCategories = categories;

          await addAccount(cookie);
          const { accounts } = await getAccounts(cookie);

          readyToAssignCategory = Object.values(initialCategories).find(
            (cat: any) => cat.name === "Ready to Assign"
          );
          testCategory = Object.values(initialCategories).find(
            (cat: any) => cat.name === "test category"
          );
          testAccount = Object.values(accounts).find(
            (account: any) => account.name == "test account"
          );

          if (!readyToAssignCategory) throw new Error("RTA category not found");
          if (!testCategory) throw new Error("Test category not found");
          if (!testAccount) throw new Error("Test account not found");
        });

        it("should carry across negative RTA balances", async () => {
          const testTransaction = {
            date: "2025-05-01T00:00:00.000Z",
            outflow: "10",
            memo: "test",
            categoryId: readyToAssignCategory.id,
            accountId: testAccount.id,
          };
          await addTransaction(cookie, testTransaction);

          jest.setSystemTime(new Date("2025-08-01T00:00:00.000Z"));
          cookie = await login();

          const { categories: updatedCategories, months: updatedMonths } =
            await getCategories(cookie);

          const updatedRtaCategory = Object.values(updatedCategories).find(
            (cat: any) => cat.id === readyToAssignCategory.id
          );
          if (!updatedRtaCategory) return;

          const rtaMonths = Object.values(updatedMonths).filter(
            (month: any) => month.categoryId === updatedRtaCategory.id
          );

          for (let i = 5; i <= 8; i++) {
            const monthStr = `2025-${i.toString().padStart(2, "0")}`;
            const month = rtaMonths.find((m: any) =>
              m.month.startsWith(monthStr)
            );
            expect(month).toBeDefined();
            expect(month?.available).toBe(-10);
          }
        });

        it("should carry across positive RTA balances", async () => {
          const testTransaction = {
            date: "2025-05-01T00:00:00.000Z",
            inflow: "10",
            memo: "test",
            categoryId: readyToAssignCategory.id,
            accountId: testAccount.id,
          };
          await addTransaction(cookie, testTransaction);

          jest.setSystemTime(new Date("2025-08-01T00:00:00.000Z"));
          cookie = await login();

          const { categories: updatedCategories, months: updatedMonths } =
            await getCategories(cookie);

          const updatedRtaCategory = Object.values(updatedCategories).find(
            (cat: any) => cat.id === readyToAssignCategory.id
          );
          if (!updatedRtaCategory) return;

          const rtaMonths = Object.values(updatedMonths).filter(
            (month: any) => month.categoryId === updatedRtaCategory.id
          );

          for (let i = 5; i <= 8; i++) {
            const monthStr = `2025-${i.toString().padStart(2, "0")}`;
            const month = rtaMonths.find((m: any) =>
              m.month.startsWith(monthStr)
            );
            expect(month).toBeDefined();
            expect(month?.available).toBe(10);
          }
        });

        it("should carry across positive category balances", async () => {
          const testTransaction = {
            date: "2025-05-01T00:00:00.000Z",
            inflow: "10",
            memo: "test",
            categoryId: testCategory.id,
            accountId: testAccount.id,
          };
          await addTransaction(cookie, testTransaction);

          jest.setSystemTime(new Date("2025-08-01T00:00:00.000Z"));
          cookie = await login();

          const { categories: updatedCategories, months: updatedMonths } =
            await getCategories(cookie);

          const updatedTestCategory = Object.values(updatedCategories).find(
            (cat: any) => cat.id === testCategory.id
          );
          if (!updatedTestCategory) return;

          const testMonths = Object.values(updatedMonths).filter(
            (month: any) => month.categoryId === updatedTestCategory.id
          );

          for (let i = 5; i <= 8; i++) {
            const monthStr = `2025-${i.toString().padStart(2, "0")}`;
            const month = testMonths.find((m: any) =>
              m.month.startsWith(monthStr)
            );
            expect(month).toBeDefined();
            expect(month?.available).toBe(10);
          }
        });

        it("should not carry across negative category balances", async () => {
          const testTransaction = {
            date: "2025-05-01T00:00:00.000Z",
            outflow: "10",
            memo: "test",
            categoryId: testCategory.id,
            accountId: testAccount.id,
          };
          await addTransaction(cookie, testTransaction);

          jest.setSystemTime(new Date("2025-08-01T00:00:00.000Z"));
          cookie = await login();

          const { categories: updatedCategories, months: updatedMonths } =
            await getCategories(cookie);

          const updatedTestCategory = Object.values(updatedCategories).find(
            (cat: any) => cat.id === testCategory.id
          );
          if (!updatedTestCategory) return;

          const testMonths = Object.values(updatedMonths).filter(
            (month: any) => month.categoryId === updatedTestCategory.id
          );

          const mayMonth = testMonths.find((m: any) =>
            m.month.startsWith("2025-05")
          );
          expect(mayMonth).toBeDefined();
          expect(mayMonth?.available).toBe(-10);

          for (let i = 6; i <= 8; i++) {
            const monthStr = `2025-${i.toString().padStart(2, "0")}`;
            const month = testMonths.find((m: any) =>
              m.month.startsWith(monthStr)
            );
            expect(month).toBeDefined();
            expect(month?.available).toBe(0);
          }
        });
      });
    });
  });
});

const testUserA = {
  email: "test@test.com",
  password: "testpasswordABC$",
};

const testUserB = {
  email: "test1@test.com",
  password: "testpasswordABC$",
};

describe("When signing up", () => {
  it("Should add Inflow category group", async () => {
    const res = await request(app).post("/user/auth/register").send(testUserA);
    const cookie = await login();

    const { categoryGroups } = await getCategories(cookie);

    const inflowCategory = Object.values(categoryGroups).filter(
      (categoryGroup) => categoryGroup.name === "Inflow"
    );

    expect(inflowCategory.length).toBe(1);
  });

  it("Should add Ready to Assign category", async () => {
    const res = await request(app).post("/user/auth/register").send(testUserA);
    const cookie = await login();

    const { categories } = await getCategories(cookie);

    const readyToAssignCategory = Object.values(categories).filter(
      (cat) => cat.name === "Ready to Assign"
    );

    expect(res.status).toBe(200);
    expect(readyToAssignCategory.length).toBe(1);
  });

  it("Should add Uncategorised category", async () => {
    const res = await request(app).post("/user/auth/register").send(testUserA);
    const cookie = await login();

    const { categories } = await getCategories(cookie);

    const uncategorisedTransactions = Object.values(categories).filter(
      (cat) => cat.name === "Uncategorised Transactions"
    );

    expect(res.status).toBe(200);
    expect(uncategorisedTransactions.length).toBe(1);
  });

  it("Should create a category with the 2 entries in months", async () => {
    await registerUser();
    const cookie = await login();

    const { categories, months } = await getCategories(cookie);

    const testCategory = Object.values(categories).find(
      (cat) => cat.name === "test category"
    );

    expect(testCategory).toBeTruthy();
    if (!testCategory) throw new Error("testCategory is Undefined");

    const categoryMonths = testCategory.months.map(
      (monthId) => months[monthId]
    );

    expect(testCategory.months.length).toBe(2);
    expect(categoryMonths.length).toBe(2);
  });
});

describe("Auth", () => {
  it.todo("Should provide a cookie in res.body.token?");
  describe("Sign up", () => {
    it("Should prevent sign up with pre-existing email address", async () => {
      const resA = await request(app)
        .post("/user/auth/register")
        .send(testUserA);
      const resB = await request(app)
        .post("/user/auth/register")
        .send(testUserA);

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(400);
    });

    it("Should allow multiple users to sign up without category name collision", async () => {
      const resA = await request(app)
        .post("/user/auth/register")
        .send(testUserA);
      const resB = await request(app)
        .post("/user/auth/register")
        .send(testUserB);

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(200);
    });
  });

  describe("Logging out", () => {
    it("Should clear cookie when logging out", async () => {
      await registerUser();
      const cookie = await login();

      const logoutRes = await request(app)
        .post("/user/auth/logout")
        .set("Cookie", `jwt=${cookie}`)
        .expect(204);

      const setCookieHeader = logoutRes.headers["set-cookie"];
      expect(setCookieHeader).toBeDefined();

      expect(setCookieHeader[0]).toMatch(/jwt=;/);
      expect(setCookieHeader[0]).toMatch(
        /Expires=Thu, 01 Jan 1970 00:00:00 GMT/
      );
    });
  });
});
