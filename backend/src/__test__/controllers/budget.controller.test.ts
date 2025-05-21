import request from "supertest";
import app from "../../app";
import { PrismaClient } from "@prisma/client";
import { NormalizedCategories } from "../../types/normalizedCategories";
import { NormalizedAccounts } from "../../types/normalizedAccounts";

const prisma = new PrismaClient();

const testUser = {
  email: "test@test.com",
  password: "testpasswordABC$",
};

const login = async () => {
  const res = await request(app).post("/user/login").send(testUser);
  const cookie = res.body;

  return cookie;
};

const registerUser = async () => {
  const res = await request(app).post("/user/register").send(testUser);

  const cookie = res.body;
  const user = await prisma.user.findFirstOrThrow({});

  const res1 = await request(app)
    .post("/budget/categoryGroup")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      name: "test category group",
    });

  const categoriesResponse = await request(app)
    .get("/budget/categories")
    .set("Authorization", `Bearer ${cookie}`);

  const responseBody = categoriesResponse.body as NormalizedCategories;

  const { categoryGroups } = responseBody;

  const testCategoryGroup = Object.values(categoryGroups).find(
    (categoryGroup) => categoryGroup.name === "test category group",
  );

  if (!testCategoryGroup) throw new Error("Unable to find test category group");

  const res2 = await request(app)
    .post("/budget/category")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      categoryGroupId: testCategoryGroup.id,
      name: "test category",
    });

  const category = await prisma.category.findFirstOrThrow({
    where: {
      name: "test category",
    },
  });

  const accountsRes = await request(app)
    .get("/budget/accounts")
    .set("Authorization", `Bearer ${cookie}`);

  const catRes = await request(app)
    .get("/budget/categories")
    .set("Authorization", `Bearer ${cookie}`);

  // console.log("WHY ARE THESE 2 DIFFERENT??");
  // console.log(accountsRes.body);
  // console.log(catRes.body);
};

const createTestAccount = async (cookie: string) => {
  const testAccount = {
    name: "test account",
    type: "BANK",
    balance: 0,
  };

  const createAccountRes = await request(app)
    .post("/budget/account")
    .set("Authorization", `Bearer ${cookie}`)
    .send(testAccount);

  const account = await prisma.account.findFirstOrThrow({
    where: {
      name: testAccount.name,
    },
  });

  return account;
};

const getCategories = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/categories")
    .set("Authorization", `Bearer ${cookie}`);
  return res.body as NormalizedCategories;
};

const getAccounts = async (cookie: string) => {
  const res = await request(app)
    .get("/budget/accounts")
    .set("Authorization", `Bearer ${cookie}`);
  return res.body as NormalizedAccounts;
};

describe("Budget", () => {
  it.todo("Should prevent users accessing/updating other users data");
  describe("Categories", () => {
    beforeEach(async () => {
      await registerUser();
    });

    it.todo("Should prevent user adding a category without category group");

    it("Should only add a single category when adding", async () => {
      const cookie = await login();
      const { categories } = await getCategories(cookie);

      const testCategory = Object.values(categories).filter(
        (cat) => cat.name === "test category",
      );
      expect(testCategory.length).toBe(1);
    });

    it("Should prevent user from adding category to Inflow group", async () => {
      const cookie = await login();
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
        .get("/budget/categories")
        .set("Authorization", `Bearer ${cookie}`);

      const responseBodyAfter =
        categoriesResponseAfter.body as NormalizedCategories;

      expect(
        Object.values(responseBodyAfter.categories).some(
          (cat) => cat.name === testCategory.name,
        ),
      ).toBe(false);
    });

    it("Should prevent user from adding categories to Uncategorised group", async () => {
      const cookie = await login();
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
        .get("/budget/categories")
        .set("Authorization", `Bearer ${cookie}`);

      const responseBodyAfter =
        categoriesResponseAfter.body as NormalizedCategories;

      expect(
        Object.values(responseBodyAfter.categories).some(
          (cat) => cat.name === testCategory.name,
        ),
      ).toBe(false);
    });

    it("Should prevent user from adding a category with a duplicate name", async () => {
      const cookie = await login();
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

  describe("Account", () => {
    beforeEach(async () => {
      await registerUser();
    });
    it("Should add an account with zero balance", async () => {
      const cookie = await login();

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

    it.todo("Should handle weird inputs on balance");
    it.todo("Should update account balance when deleting transaction");
    it.todo("Should update account balance when duplicating transaction");
  });

  describe("Transaction", () => {
    beforeEach(async () => {
      await registerUser();
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

    it.skip("When adding a transaction with no account, returns 400", async () => {
      const cookie = await login();
    });

    it("When adding a transaction with no category, transaction is assigned to Uncategorised", async () => {
      const cookie = await login();
      const account = await createTestAccount(cookie);

      const testTransaction = {
        accountId: account.id,
        outflow: "10",
      };

      const addTransactionRes = await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testTransaction);

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

      expect.hasAssertions();
    });

    it.todo("Should correctly duplicate transactions");
  });

  describe("Months", () => {
    beforeEach(async () => {
      await registerUser();
    });

    it("Should create correct amount of months when adding a transaction in the past", async () => {
      const cookie = await login();

      const testAccountData = {
        name: "test account",
        type: "BANK",
        balance: 50,
      };

      const testTransaction = {
        outflow: "10",
        memo: "test",
      };

      const resAddAccount = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountData);

      expect(resAddAccount.status).toBe(200);

      const { accounts } = await getAccounts(cookie);

      const testAccount = Object.values(accounts).find(
        (account) => account.name == "test account",
      );

      if (!testAccount) throw new Error("No account found");

      const { id: accountId } = testAccount;

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const resAddTransaction = await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          ...testTransaction,
          accountId,
          date: oneYearAgo,
        });

      expect(resAddTransaction.status).toBe(200);

      const { categories } = await getCategories(cookie);

      const uncategorisedTransactionsCategory = Object.values(categories).find(
        (cat) => cat.name === "Uncategorised Transactions",
      );

      const testCategory = Object.values(categories).find(
        (cat) => cat.name === "test category",
      );

      expect(uncategorisedTransactionsCategory?.months.length).toBe(14);
      expect(testCategory?.months.length).toBe(14);
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
    const res = await request(app).post("/user/register").send(testUserA);
    const cookie = await login();

    const { categoryGroups } = await getCategories(cookie);

    const inflowCategory = Object.values(categoryGroups).filter(
      (categoryGroup) => categoryGroup.name === "Inflow",
    );

    expect(inflowCategory.length).toBe(1);
  });

  it("Should add Ready to Assign category", async () => {
    const res = await request(app).post("/user/register").send(testUserA);
    const cookie = await login();

    const { categories } = await getCategories(cookie);

    const readyToAssignCategory = Object.values(categories).filter(
      (cat) => cat.name === "Ready to Assign",
    );

    expect(res.status).toBe(200);
    expect(readyToAssignCategory.length).toBe(1);
  });

  it("Should add Uncategorised category", async () => {
    const res = await request(app).post("/user/register").send(testUserA);
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
      const resA = await request(app).post("/user/register").send(testUserA);
      const resB = await request(app).post("/user/register").send(testUserA);

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(400);
    });

    it("Should allow multiple users to sign up without category name collision", async () => {
      const resA = await request(app).post("/user/register").send(testUserA);
      const resB = await request(app).post("/user/register").send(testUserB);

      expect(resA.status).toBe(200);
      expect(resB.status).toBe(200);
    });
  });

  describe("Logging out", () => {
    it("Should clear cookie when logging out", async () => {
      await registerUser();
      const cookie = await login();

      const logoutRes = await request(app)
        .post("/user/logout")
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
