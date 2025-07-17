import request from "supertest";
import app from "../../app";
import { NormalisedCategories } from "../../features/budget/category/category.types";
import { getAccounts, getCategories } from "../utils/getData";
import { createTestAccount } from "../utils/createTestAccount";
import { login, registerUser } from "../utils/auth";

describe("Budget", () => {
  it.todo("Should prevent users accessing/updating other users data");

  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Categories", () => {
    describe("Delete category", () => {
      it.todo("should recalculate position of other categories");
      it.todo("should throw error if user doesn't own category");
      it.todo("should throw error if user doesn't own inheriting category");
      it.todo("should throw error if no inheriting category provided");
      it.todo("should throw error if inherting category is protected category");
      it.todo(
        "should correctly update rta when deleting category with assigned",
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
        "Should prevent user from adding a category to a category group they don't own",
      );
      it.todo("Should correctly assign position when categoryGroup empty");

      it.todo(
        "Should correctly assign position when categoryGroup has other categories",
      );
      it("Should only add a single category when adding", async () => {
        const { categories } = await getCategories(cookie);

        const testCategory = Object.values(categories).filter(
          (cat) => cat.name === "test category",
        );
        expect(testCategory.length).toBe(1);
      });
      it("Should prevent user from adding category to Inflow group", async () => {
        const { categoryGroups } = await getCategories(cookie);

        const inflowCategoryGroup = Object.values(categoryGroups).find(
          (categoryGroup) => categoryGroup.name === "Inflow",
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
            (cat) => cat.name === testCategory.name,
          ),
        ).toBe(false);
      });

      it("Should prevent user from adding categories to Uncategorised group", async () => {
        const { categoryGroups } = await getCategories(cookie);

        const uncategorisedCategoryGroup = Object.values(categoryGroups).find(
          (categoryGroup) => categoryGroup.name === "Uncategorised",
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
            (cat) => cat.name === testCategory.name,
          ),
        ).toBe(false);
      });

      it("Should prevent user from adding a category with a duplicate name", async () => {
        const { categoryGroups, categories } = await getCategories(cookie);

        const testCategoryGroup = Object.values(categoryGroups).find(
          (cg) => cg.name === "test category group",
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
            cat.categoryGroupId === testCategory.categoryGroupId,
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
              cat.categoryGroupId === testCategory.categoryGroupId,
          ).length,
        ).toBe(1);
      });

      it.todo(
        "Should prevent user from adding a category group with a duplicate name",
      );
    });
  });

  describe("Category groups", () => {
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

  describe("Account", () => {
    describe("create", () => {
      it.todo("prevent name collisions");
      it.todo("should add account with initial balance");
      it("Should add an account with zero balance", async () => {
        const testAccountData = {
          name: "test account",
          type: "BANK",
          balance: 0,
        };

        const resAddAccount = await request(app)
          .post("/budget/account")
          .set("Authorization", `Bearer ${cookie}`)
          .send(testAccountData);

        expect(resAddAccount.status).toBe(200);

        const { accounts } = await getAccounts(cookie);

        const testAccount = Object.values(accounts).filter(
          (account) => account.name === testAccountData.name,
        );

        const transactions = testAccount[0].transactions;
        const accountData = testAccount[0];

        expect(testAccount.length).toBe(1);
        expect(accountData.balance).toBe(0);
        expect(transactions.length).toBe(0);
      });
    });

    describe("delete", () => {
      it.todo("should throw error if account not owned by user/found");
      it.todo("should delete account if it has transactions and zero balance");
      it.todo(
        "should close account and zero balance if it has transactions and non zero balance",
      );
    });

    describe("update", () => {
      it.todo("should throw error if account not owned by user/found");
      it.todo("should update name when provided");
      it.todo("should adjust balance with an rta transaction");
    });

    it.todo("Should handle weird inputs on balance");
    it.todo("Should update account balance when deleting transaction");
    it.todo("Should update account balance when duplicating transaction");
  });

  describe("Transaction", () => {
    describe("Adding transaction", () => {
      it.todo(
        "should throw error if user tries adding to account not owned by themselves",
      );
    });
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
      "should throw error if category id provided doesn't exist/ not owned by user",
    );

    it.skip("When adding a transaction with no account, returns 400", async () => { });

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
        (t) => t.outflow === 10,
      );

      if (!transaction) throw new Error("Unable to find test transaction");

      const uncategorisedCategory = Object.values(categories).find(
        (c) => c.name === "Uncategorised Transactions",
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

  describe("Ready to assign", () => { });

  describe("Months", () => {
    it("should prevent user from assigning to uncategorised category month", async () => {
      const { categories } = await getCategories(cookie);

      const uncategorisedCategory = Object.values(categories).find(
        (c) => c.name === "Uncategorised Transactions",
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
        (cat) => cat.name === "test category",
      );
      if (!testCategory) throw new Error("No category found");

      const testAccount = Object.values(accounts).find(
        (account) => account.name == "test account",
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
        (t) => t.memo === "test",
      );

      if (!transaction) throw new Error("Unable to find test transaction");

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({ transactionIds: [transaction.id] })
        .expect(200);

      const { months } = await getCategories(cookie);

      const testMonths = Object.values(months).filter(
        (month) => month.categoryId === testCategory.id,
      );

      expect(testMonths[0].activity).toBe(0);
      expect(testMonths[0].available).toBe(0);
      expect(testMonths[1].activity).toBe(0);
      expect(testMonths[1].available).toBe(0);
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
      (categoryGroup) => categoryGroup.name === "Inflow",
    );

    expect(inflowCategory.length).toBe(1);
  });

  it("Should add Ready to Assign category", async () => {
    const res = await request(app).post("/user/auth/register").send(testUserA);
    const cookie = await login();

    const { categories } = await getCategories(cookie);

    const readyToAssignCategory = Object.values(categories).filter(
      (cat) => cat.name === "Ready to Assign",
    );

    expect(res.status).toBe(200);
    expect(readyToAssignCategory.length).toBe(1);
  });

  it("Should add Uncategorised category", async () => {
    const res = await request(app).post("/user/auth/register").send(testUserA);
    const cookie = await login();

    const { categories } = await getCategories(cookie);

    const uncategorisedTransactions = Object.values(categories).filter(
      (cat) => cat.name === "Uncategorised Transactions",
    );

    expect(res.status).toBe(200);
    expect(uncategorisedTransactions.length).toBe(1);
  });

  it("Should create a category with the 2 entries in months", async () => {
    await registerUser();
    const cookie = await login();

    const { categories, months } = await getCategories(cookie);

    const testCategory = Object.values(categories).find(
      (cat) => cat.name === "test category",
    );

    expect(testCategory).toBeTruthy();
    if (!testCategory) throw new Error("testCategory is Undefined");

    const categoryMonths = testCategory.months.map(
      (monthId) => months[monthId],
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
        /Expires=Thu, 01 Jan 1970 00:00:00 GMT/,
      );
    });
  });
});
