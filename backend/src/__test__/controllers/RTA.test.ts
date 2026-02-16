import request from "supertest";
import app from "../../app";
import {
  getAccounts,
  getCategories,
  getReadyToAssignMonths,
} from "../utils/getData";
import { login, registerUser } from "../utils/auth";
import { type db } from "../../features/budget/account/account.types";
import { prisma } from "../../shared/prisma/client";
import { createAccountAndFetch } from "../utils/account";

const compareRTAMonthsToExpected = async (
  expected: number[],
  cookie: string,
  debug: boolean = false
) => {
  const readyToAssignMonths = await getReadyToAssignMonths(cookie);

  if (debug) {
    console.log("ready to assign months", readyToAssignMonths);
  }

  expect(expected.length).toBe(readyToAssignMonths.length);

  readyToAssignMonths.forEach((month, i) => {
    expect(month.available).toBe(expected[i]);
  });
};

type TransactionKind = "inflow" | "outflow";

const getTransactionId = async (
  amount: number,
  cookie: string,
  type: TransactionKind = "inflow"
) => {
  const { transactions } = await getAccounts(cookie);

  const inflowTransaction = Object.values(transactions).find(
    (transaction) => transaction[type] === amount
  );

  if (!inflowTransaction) throw new Error("Unable to find transaction");

  return inflowTransaction.id;
};

const getRTACategoryId = async (cookie: string) => {
  const { categories } = await getCategories(cookie);

  const readyToAssignCategoryId = Object.values(categories).find(
    (cat) => cat.name === "Ready to Assign"
  )?.id;

  if (!readyToAssignCategoryId)
    throw new Error("Ready to Assign category not found");

  return readyToAssignCategoryId;
};

const createCategory = async ({
  cookie,
  name,
}: {
  cookie: string;
  name: string;
}) => {
  await request(app)
    .post("/budget/categorygroup")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      name: "test categoryGroup",
    });

  const { categoryGroups } = await getCategories(cookie);

  const testCategoryGroup = Object.values(categoryGroups).find(
    (categoryGroup) => categoryGroup.name === "test category group"
  );

  if (!testCategoryGroup)
    throw new Error(`Unable to find created- ${name} category group`);

  await request(app)
    .post("/budget/category")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      categoryGroupId: testCategoryGroup.id,
      name,
    });

  const { categories } = await getCategories(cookie);

  const categoryId = Object.values(categories).find(
    (cat) => cat.name === name
  )?.id;

  return categoryId;
};

const createTestCategory = async (cookie: string) => {
  await request(app)
    .post("/budget/categorygroup")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      name: "test category group a",
    });

  const { categoryGroups } = await getCategories(cookie);

  const testCategoryGroup = Object.values(categoryGroups).find(
    (categoryGroup) => categoryGroup.name === "test category group a"
  );

  if (!testCategoryGroup) throw new Error("Unable to find test category group");

  await request(app)
    .post("/budget/category")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      categoryGroupId: testCategoryGroup.id,
      name: "test category a",
    });

  const { categories } = await getCategories(cookie);

  const readyToAssignCategoryId = Object.values(categories).find(
    (cat) => cat.name === "test category a"
  )?.id;

  return readyToAssignCategoryId;
};

const addTransaction = async ({
  cookie,
  inflow,
  outflow,
  categoryId,
  accountId,
  date,
}: {
  cookie: string;
  inflow?: string;
  outflow?: string;
  categoryId?: string;
  accountId: string;
  date?: string;
}) => {
  await request(app)
    .post("/budget/transaction")
    .set("Authorization", `Bearer ${cookie}`)
    .send({
      inflow,
      outflow,
      categoryId,
      accountId,
      date,
    })
    .expect(200);
};

describe("RTA allocation", () => {
  let cookie: string;
  let RTACategoryId: string;
  let testAccount: db.Account;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
    RTACategoryId = await getRTACategoryId(cookie);
    testAccount = await createAccountAndFetch(cookie);
  });

  describe("adding transactions", () => {
    describe("update number of months", () => {
      it("should create correct amount of months when adding a transaction in the past", async () => {
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
          (account) => account.name == "test account"
        );

        if (!testAccount) throw new Error("No account found");

        const { id: accountId } = testAccount;

        const now = new Date();
        const earliestAllowed = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)
        );

        const resAddTransaction = await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            ...testTransaction,
            accountId,
            date: earliestAllowed,
          });

        expect(resAddTransaction.status).toBe(200);

        const { categories } = await getCategories(cookie);

        const uncategorisedTransactionsCategory = Object.values(
          categories
        ).find((cat) => cat.name === "Uncategorised Transactions");

        const testCategory = Object.values(categories).find(
          (cat) => cat.name === "test category"
        );

        expect(uncategorisedTransactionsCategory?.months.length).toBe(13);
        expect(testCategory?.months.length).toBe(13);
      });
    });
    describe("update activity/available", () => {
      it("should update available/activity when adding an inflow transaction", async () => {
        const cookie = await login();
        const testAccountData = {
          name: "test account",
          type: "BANK",
          balance: 0,
        };
        await request(app)
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

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "10",
            memo: "test",
            categoryId: testCategory.id,
            accountId,
          })
          .expect(200);

        const { months } = await getCategories(cookie);

        const testMonths = Object.values(months).filter(
          (month) => month.categoryId === testCategory.id
        );

        expect(testMonths[0].activity).toBe(10);
        expect(testMonths[0].available).toBe(10);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(10);
      });

      it("should update available/activity when adding an outflow categorised transaction", async () => {
        const cookie = await login();
        const testTransaction = {
          outflow: "10",
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

        const { months } = await getCategories(cookie);

        const testMonths = Object.values(months).filter(
          (month) => month.categoryId === testCategory.id
        );

        const readyToAssignCategory = Object.values(categories).find(
          (cat) => cat.name === "Ready to Assign"
        );

        if (!readyToAssignCategory)
          throw new Error("Unable to find test transaction");

        const readyToAssignCategoryMonths = Object.values(months).filter(
          (month) => month.categoryId === readyToAssignCategory.id
        );

        expect(testMonths[0].activity).toBe(-10);
        expect(testMonths[0].available).toBe(-10);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(0);
        expect(readyToAssignCategoryMonths[0].available).toBe(0);
        expect(readyToAssignCategoryMonths[1].available).toBe(-10);
      });

      it("should update available/activity when adding an outflow and inflow to the same category", async () => {
        const cookie = await login();
        const testTransaction = {
          outflow: "10",
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

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "10",
            memo: "test inflow",
            categoryId: testCategory.id,
            accountId,
          })
          .expect(200);

        const { transactions } = await getAccounts(cookie);

        const transaction = Object.values(transactions).find(
          (t) => t.memo === "test"
        );

        if (!transaction) throw new Error("Unable to find test transaction");
        const { months } = await getCategories(cookie);

        const testMonths = Object.values(months).filter(
          (month) => month.categoryId === testCategory.id
        );

        const readyToAssignCategory = Object.values(categories).find(
          (cat) => cat.name === "Ready to Assign"
        );

        if (!readyToAssignCategory)
          throw new Error("Unable to find test transaction");

        const readyToAssignCategoryMonths = Object.values(months).filter(
          (month) => month.categoryId === readyToAssignCategory.id
        );

        expect(testMonths[0].activity).toBe(0);
        expect(testMonths[0].available).toBe(0);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(0);
        expect(readyToAssignCategoryMonths[0].available).toBe(0);
        expect(readyToAssignCategoryMonths[1].available).toBe(0);
      });

      it("should update available/activity when adding an outflow and inflow to the same category - inflow - outflow", async () => {
        const cookie = await login();
        const testTransaction = {
          outflow: "10",
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

        const readyToAssignCategory = Object.values(categories).find(
          (cat) => cat.name === "Ready to Assign"
        );

        if (!readyToAssignCategory)
          throw new Error("Unable to find test transaction");

        const { id: accountId } = testAccount;

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "10",
            memo: "test inflow",
            categoryId: testCategory.id,
            accountId,
          })
          .expect(200);

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
        const { months } = await getCategories(cookie);

        const testMonths = Object.values(months).filter(
          (month) => month.categoryId === testCategory.id
        );
        const readyToAssignCategoryMonths = Object.values(months).filter(
          (month) => month.categoryId === readyToAssignCategory.id
        );

        expect(testMonths[0].activity).toBe(0);
        expect(testMonths[0].available).toBe(0);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(0);
        expect(readyToAssignCategoryMonths[0].available).toBe(0);
        expect(readyToAssignCategoryMonths[1].available).toBe(0);
      });

      it("should update available/activity and RTA when adding an outflow to uncategorised ", async () => {
        const cookie = await login();
        const testTransaction = {
          outflow: "23",
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

        const uncategorisedTransactionsCategory = Object.values(
          categories
        ).find((cat) => cat.name === "Uncategorised Transactions");
        if (!uncategorisedTransactionsCategory)
          throw new Error("No category found");

        const testAccount = Object.values(accounts).find(
          (account) => account.name == "test account"
        );

        if (!testAccount) throw new Error("No account found");

        const { id: accountId } = testAccount;

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            ...testTransaction,
            accountId,
          })
          .expect(200);

        // await request(app)
        //   .post("/budget/transaction")
        //   .set("Authorization", `Bearer ${cookie}`)
        //   .send({
        //     inflow: "23",
        //     memo: "test inflow",
        //     categoryId: testCategory.id,
        //     accountId,
        //   })
        //   .expect(200);

        const { transactions } = await getAccounts(cookie);

        const transaction = Object.values(transactions).find(
          (t) => t.memo === "test"
        );

        if (!transaction) throw new Error("Unable to find test transaction");
        const { months } = await getCategories(cookie);

        const testMonths = Object.values(months).filter(
          (month) => month.categoryId === uncategorisedTransactionsCategory.id
        );

        const readyToAssignCategory = Object.values(categories).find(
          (cat) => cat.name === "Ready to Assign"
        );

        if (!readyToAssignCategory)
          throw new Error("Unable to find test transaction");

        const readyToAssignCategoryMonths = Object.values(months).filter(
          (month) => month.categoryId === readyToAssignCategory.id
        );

        expect(testMonths[0].activity).toBe(-23);
        expect(testMonths[0].available).toBe(-23);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(0);
        expect(readyToAssignCategoryMonths[0].available).toBe(0);
        expect(readyToAssignCategoryMonths[1].available).toBe(-23);
      });
    });
    describe("updating rta", () => {
      it("bug fix add RTA inflow £10 3ma, add RTA outflow £20 2ma, add cat outflow 20 cm", async () => {
        const { categories } = await getCategories(cookie);

        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth(); // 0-based: 0 = Jan

        const oneMonthAgoUTC = new Date(Date.UTC(year, month - 1, 1));
        const threeMonthAgoUTC = new Date(Date.UTC(year, month - 3, 1));
        const testAccount = await createAccountAndFetch(cookie);

        const testCategory = Object.values(categories).find(
          (cat) => cat.name === "test category"
        );

        if (!testCategory)
          throw new Error("Unable to find test category month");

        const rtaCategoryId = await getRTACategoryId(cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "10",
            accountId: testAccount.id,
            categoryId: rtaCategoryId,
            date: threeMonthAgoUTC,
          })
          .expect(200);

        await compareRTAMonthsToExpected([10, 10, 10, 10, 10], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "20",
            accountId: testAccount.id,
            categoryId: rtaCategoryId,
            date: oneMonthAgoUTC,
          })
          .expect(200);

        await compareRTAMonthsToExpected([10, 10, -10, -10, -10], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "20",
            accountId: testAccount.id,
          })
          .expect(200);

        await compareRTAMonthsToExpected([10, 10, -10, -10, -30], cookie);
      });
      it("should update rta when adding categorised outflow transaction", async () => {
        const { categories } = await getCategories(cookie);

        const testCategory = Object.values(categories).find(
          (cat) => cat.name === "test category"
        );

        if (!testCategory)
          throw new Error("Unable to find test category month");

        const testAccount = await createAccountAndFetch(cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "40",
            accountId: testAccount.id,
            categoryId: testCategory.id,
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, -40], cookie);
      });

      it("should not alter rta when adding inflow categorised transaction", async () => {
        const { categories } = await getCategories(cookie);

        const testCategory = Object.values(categories).find(
          (cat) => cat.name === "test category"
        );

        if (!testCategory)
          throw new Error("Unable to find test category month");

        const testAccount = await createAccountAndFetch(cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "40",
            accountId: testAccount.id,
            categoryId: testCategory.id,
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0], cookie);
      });

      it("should handle multiple inflow/outflow categorised (same category) for different months", async () => {
        const testCategoryId = await createCategory({
          cookie,
          name: "my test category",
        });

        const testAccount = await createAccountAndFetch(cookie);
        const now = new Date();
        const twoMonthsAgo = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2)
        );
        const lastMonth = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1)
        );
        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "40",
            accountId: testAccount.id,
            categoryId: testCategoryId,
            date: twoMonthsAgo,
          })
          .expect(200);

        const { months } = await getCategories(cookie);

        const uncategorisedMonths = Object.values(months).filter(
          (month) => month.categoryId === testCategoryId
        );

        expect(uncategorisedMonths[0].activity).toBe(40);
        expect(uncategorisedMonths[0].available).toBe(40);
        expect(uncategorisedMonths[1].activity).toBe(0);
        expect(uncategorisedMonths[1].available).toBe(40);
        await compareRTAMonthsToExpected([0, 0, 0, 0], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "40",
            accountId: testAccount.id,
            categoryId: testCategoryId,
            date: lastMonth,
          })
          .expect(200);

        const { months: updatedMthsA } = await getCategories(cookie);

        const uncategorisedMonthsA = Object.values(updatedMthsA).filter(
          (month) => month.categoryId === testCategoryId
        );

        expect(uncategorisedMonthsA[0].activity).toBe(40);
        expect(uncategorisedMonthsA[0].available).toBe(40);
        expect(uncategorisedMonthsA[1].activity).toBe(-40);
        expect(uncategorisedMonthsA[1].available).toBe(0);
        expect(uncategorisedMonthsA[2].activity).toBe(0);
        expect(uncategorisedMonthsA[2].available).toBe(0);
        await compareRTAMonthsToExpected([0, 0, 0, 0], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "10",
            accountId: testAccount.id,
            categoryId: testCategoryId,
          })
          .expect(200);

        const { months: updatedMthsB } = await getCategories(cookie);

        const uncategorisedMonthsB = Object.values(updatedMthsB).filter(
          (month) => month.categoryId === testCategoryId
        );

        expect(uncategorisedMonthsB[0].activity).toBe(40);
        expect(uncategorisedMonthsB[0].available).toBe(40);
        expect(uncategorisedMonthsB[1].activity).toBe(-40);
        expect(uncategorisedMonthsB[1].available).toBe(0);
        expect(uncategorisedMonthsB[2].activity).toBe(-10);
        expect(uncategorisedMonthsB[2].available).toBe(-10);
        expect(uncategorisedMonthsB[3].activity).toBe(0);
        expect(uncategorisedMonthsB[3].available).toBe(0);
        await compareRTAMonthsToExpected([0, 0, 0, -10], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "40",
            accountId: testAccount.id,
            categoryId: testCategoryId,
            date: twoMonthsAgo,
          })
          .expect(200);
        const { months: updatedMthsC } = await getCategories(cookie);

        const uncategorisedMonthsC = Object.values(updatedMthsC).filter(
          (month) => month.categoryId === testCategoryId
        );

        expect(uncategorisedMonthsC[0].activity).toBe(0);
        expect(uncategorisedMonthsC[0].available).toBe(0);
        expect(uncategorisedMonthsC[1].activity).toBe(-40);
        expect(uncategorisedMonthsC[1].available).toBe(-40);
        expect(uncategorisedMonthsC[2].activity).toBe(-10);
        expect(uncategorisedMonthsC[2].available).toBe(-10);
        expect(uncategorisedMonthsC[3].activity).toBe(0);
        expect(uncategorisedMonthsC[3].available).toBe(0);
        await compareRTAMonthsToExpected([0, 0, -40, -50], cookie);
      });

      it("should update rta when adding inflow/outflow to different categories", async () => {
        const testCategoryId = await createCategory({
          cookie,
          name: "my test category",
        });

        const testAccount = await createAccountAndFetch(cookie);
        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "10",
            accountId: testAccount.id,
          })
          .expect(200);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "40",
            accountId: testAccount.id,
            categoryId: testCategoryId,
          })
          .expect(200);

        const { months: updatedMthsA } = await getCategories(cookie);

        const uncategorisedMonthsA = Object.values(updatedMthsA).filter(
          (month) => month.categoryId === testCategoryId
        );

        expect(uncategorisedMonthsA[0].activity).toBe(40);
        expect(uncategorisedMonthsA[0].available).toBe(40);
        expect(uncategorisedMonthsA[1].activity).toBe(0);
        expect(uncategorisedMonthsA[1].available).toBe(40);
        await compareRTAMonthsToExpected([0, -10], cookie);
      });

      it("should handle rta inflow transaction", async () => {
        const { categories } = await getCategories(cookie);

        const testAccount = await createAccountAndFetch(cookie);

        const readyToAssignCategoryId = Object.values(categories).find(
          (cat) => cat.name === "Ready to Assign"
        )?.id;

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "10",
            accountId: testAccount.id,
            categoryId: readyToAssignCategoryId,
          })
          .expect(200);

        await compareRTAMonthsToExpected([10, 10], cookie);
      });

      it("should update rta months in the future adding rta inflow/outflow in the past", async () => {
        const { categories } = await getCategories(cookie);

        const uncategorisedTransactionsCategory = Object.values(
          categories
        ).find((cat) => cat.name === "Uncategorised Transactions");

        if (!uncategorisedTransactionsCategory)
          throw new Error("No category found");

        const readyToAssignCategoryId = Object.values(categories).find(
          (cat) => cat.name === "Ready to Assign"
        )?.id;

        if (!testAccount) throw new Error("Unable to find test account");

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "10",
            accountId: testAccount.id,
            categoryId: readyToAssignCategoryId,
          })
          .expect(200);

        await compareRTAMonthsToExpected([10, 10], cookie);

        const dateThreeMonthsAgo = new Date();
        dateThreeMonthsAgo.setMonth(dateThreeMonthsAgo.getMonth() - 3);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "10",
            accountId: testAccount.id,
            date: dateThreeMonthsAgo,
          })
          .expect(200);

        const { months } = await getCategories(cookie);

        const uncategorisedMonths = Object.values(months).filter(
          (month) => month.categoryId === uncategorisedTransactionsCategory.id
        );

        expect(uncategorisedMonths[0].activity).toBe(-10);
        expect(uncategorisedMonths[0].available).toBe(-10);
        expect(uncategorisedMonths[1].activity).toBe(0);
        expect(uncategorisedMonths[1].available).toBe(0);
        expect(uncategorisedMonths[2].activity).toBe(0);
        expect(uncategorisedMonths[2].available).toBe(0);
        await compareRTAMonthsToExpected([0, -10, -10, 0, 0], cookie);
      });

      it("should update rta months when adding an inflow>(-available)", async () => {
        const { categories } = await getCategories(cookie);

        const uncategorisedTransactionsCategory = Object.values(
          categories
        ).find((cat) => cat.name === "Uncategorised Transactions");

        if (!uncategorisedTransactionsCategory)
          throw new Error("No category found");

        const readyToAssignCategoryId = Object.values(categories).find(
          (cat) => cat.name === "Ready to Assign"
        )?.id;

        if (!testAccount) throw new Error("Unable to find test account");

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "50",
            accountId: testAccount.id,
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, -50], cookie);

        const dateThreeMonthsAgo = new Date();
        dateThreeMonthsAgo.setMonth(dateThreeMonthsAgo.getMonth() - 3);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "70",
            accountId: testAccount.id,
          })
          .expect(200);

        const { months } = await getCategories(cookie);

        const uncategorisedMonths = Object.values(months).filter(
          (month) => month.categoryId === uncategorisedTransactionsCategory.id
        );

        expect(uncategorisedMonths[0].activity).toBe(20);
        expect(uncategorisedMonths[0].available).toBe(20);
        expect(uncategorisedMonths[1].activity).toBe(0);
        expect(uncategorisedMonths[1].available).toBe(20);
        await compareRTAMonthsToExpected([0, 0], cookie);
      });

      it("should update rta for future months when adding transaction", async () => {
        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "10",
            accountId: testAccount.id,
          })
          .expect(200);

        const { categories: updatedCategories } = await getCategories(cookie);
        const testCategoryUpdated = Object.values(updatedCategories).find(
          (cat) => cat.name === "Ready to Assign"
        );

        if (!testCategoryUpdated)
          throw new Error("Unable to find test account");

        const readyToAssignMonths = await getReadyToAssignMonths(cookie);

        expect(readyToAssignMonths[0].available).toBe(0);
        expect(readyToAssignMonths[1].available).toBe(-10);
      });

      it("should handle adding outflow categorised transaction when rta > 0", async () => {
        const testAccount = await createAccountAndFetch(cookie);

        const { categories } = await getCategories(cookie);

        const testCategory = Object.values(categories).find(
          (cat) => cat.name === "Ready to Assign"
        );

        if (!testCategory)
          throw new Error("Unable to find test category month");

        const { accounts } = await getAccounts(cookie);

        const readyToAssignCategoryId = Object.values(categories).find(
          (cat) => cat.name === "Ready to Assign"
        )?.id;

        if (!testAccount) throw new Error("Unable to find test account");

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "10",
            accountId: testAccount.id,
            categoryId: readyToAssignCategoryId,
          })
          .expect(200);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "10",
            accountId: testAccount.id,
          })
          .expect(200);

        const { categories: updatedCategories } = await getCategories(cookie);
        const testCategoryUpdated = Object.values(updatedCategories).find(
          (cat) => cat.name === "Ready to Assign"
        );

        if (!testCategoryUpdated)
          throw new Error("Unable to find test account");

        const readyToAssignMonths = await getReadyToAssignMonths(cookie);

        expect(readyToAssignMonths[0].available).toBe(10);
        expect(readyToAssignMonths[1].available).toBe(0);
      });
    });
    describe("all together", () => {
      it("Should handle a bit of everything", async () => {
        const { categories } = await getCategories(cookie);

        const testCategory = Object.values(categories).find(
          (cat) => cat.name === "test category"
        );

        if (!testCategory)
          throw new Error("Unable to find test category month");

        await request(app)
          .patch("/budget/assign")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            assigned: "10",
            monthId: testCategory.months[0],
          })
          .expect(200);

        await request(app)
          .patch("/budget/assign")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            assigned: "10",
            monthId: testCategory.months[1],
          })
          .expect(200);

        await compareRTAMonthsToExpected([-10, -20], cookie);

        await request(app)
          .patch("/budget/assign")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            assigned: "0",
            monthId: testCategory.months[1],
          })
          .expect(200);

        await compareRTAMonthsToExpected([-10, -10], cookie);

        await request(app)
          .patch("/budget/assign")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            assigned: "0",
            monthId: testCategory.months[0],
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0], cookie);

        const testAccount = await createAccountAndFetch(cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "1.11",
            accountId: testAccount.id,
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0], cookie);

        await request(app)
          .delete("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({ transactionIds: [await getTransactionId(1.11, cookie)] })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0], cookie);

        const rtaCategoryId = await getRTACategoryId(cookie);
        const dateThreeMonthsAgo = new Date();
        dateThreeMonthsAgo.setMonth(dateThreeMonthsAgo.getMonth() - 3);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "1.12",
            accountId: testAccount.id,
            categoryId: rtaCategoryId,
            date: dateThreeMonthsAgo,
          })
          .expect(200);

        await compareRTAMonthsToExpected(
          [1.12, 1.12, 1.12, 1.12, 1.12],
          cookie
        );

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "1.13",
            accountId: testAccount.id,
            categoryId: rtaCategoryId,
          })
          .expect(200);

        await compareRTAMonthsToExpected(
          [1.12, 1.12, 1.12, 2.25, 2.25],
          cookie
        );

        await request(app)
          .delete("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({ transactionIds: [await getTransactionId(1.13, cookie)] })
          .expect(200);

        await compareRTAMonthsToExpected(
          [1.12, 1.12, 1.12, 1.12, 1.12],
          cookie
        );

        await request(app)
          .delete("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({ transactionIds: [await getTransactionId(1.12, cookie)] })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0, 0, 0, 0], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "0.01",
            accountId: testAccount.id,
            categoryId: rtaCategoryId,
            date: dateThreeMonthsAgo,
          })
          .expect(200);

        await compareRTAMonthsToExpected(
          [-0.01, -0.01, -0.01, -0.01, -0.01],
          cookie
        );

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "0.02",
            accountId: testAccount.id,
            categoryId: rtaCategoryId,
          })
          .expect(200);

        await compareRTAMonthsToExpected(
          [-0.01, -0.01, -0.01, 0.01, 0.01],
          cookie
        );

        await request(app)
          .delete("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            transactionIds: [await getTransactionId(0.01, cookie, "outflow")],
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0, 0, 0.02, 0.02], cookie);

        await request(app)
          .delete("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            transactionIds: [await getTransactionId(0.02, cookie, "inflow")],
          })
          .expect(200);
        await compareRTAMonthsToExpected([0, 0, 0, 0, 0], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "0.04",
            accountId: testAccount.id,
            categoryId: rtaCategoryId,
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0, 0, 0.04, 0.04], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "0.03",
            accountId: testAccount.id,
            categoryId: rtaCategoryId,
            date: dateThreeMonthsAgo,
          })
          .expect(200);

        await compareRTAMonthsToExpected(
          [-0.03, -0.03, -0.03, 0.01, 0.01],
          cookie
        );

        await request(app)
          .delete("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            transactionIds: [await getTransactionId(0.03, cookie, "outflow")],
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0, 0, 0.04, 0.04], cookie);

        await request(app)
          .delete("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            transactionIds: [await getTransactionId(0.04, cookie)],
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0, 0, 0, 0], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            outflow: "39.01",
            accountId: testAccount.id,
            categoryId: testCategory.id,
          })
          .expect(200);

        await compareRTAMonthsToExpected([0, 0, 0, 0, -39.01], cookie);

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            inflow: "39",
            accountId: testAccount.id,
            categoryId: rtaCategoryId,
            date: dateThreeMonthsAgo,
          })
          .expect(200);

        await compareRTAMonthsToExpected([39, 39, 39, 39, -0.01], cookie);
      });
    });
  });

  describe("deleting transactions", () => {
    it("Should correctly delete single RTA inflow transactions", async () => {
      const { categories } = await getCategories(cookie);

      const testCategory = Object.values(categories).find(
        (cat) => cat.name === "test category"
      );

      if (!testCategory) throw new Error("Unable to find test category month");

      await addTransaction({
        cookie,
        inflow: "10",
        categoryId: RTACategoryId,
        accountId: testAccount.id,
      });

      await compareRTAMonthsToExpected([10, 10], cookie);

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          transactionIds: [await getTransactionId(10, cookie)],
        })
        .expect(200);

      await compareRTAMonthsToExpected([0, 0], cookie);
    });

    it("should update available/activity when deleting an outflow categorised transaction", async () => {
      const cookie = await login();
      const testTransaction = {
        outflow: "10",
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

      const readyToAssignCategory = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      );

      if (!readyToAssignCategory)
        throw new Error("Unable to find test transaction");

      const readyToAssignCategoryMonths = Object.values(months).filter(
        (month) => month.categoryId === readyToAssignCategory.id
      );

      expect(testMonths[0].activity).toBe(0);
      expect(testMonths[0].available).toBe(0);
      expect(testMonths[1].activity).toBe(0);
      expect(testMonths[1].available).toBe(0);
      expect(readyToAssignCategoryMonths[0].available).toBe(0);
      expect(readyToAssignCategoryMonths[1].available).toBe(0);
    });

    it("Should correctly delete single RTA outflow transactions", async () => {
      const dateThreeMonthsAgo = new Date();
      dateThreeMonthsAgo.setMonth(dateThreeMonthsAgo.getMonth() - 3);

      const { categories } = await getCategories(cookie);

      const RTACategoryId = await getRTACategoryId(cookie);
      const testAccount = await createAccountAndFetch(cookie);

      const testCategory = Object.values(categories).find(
        (cat) => cat.name === "test category"
      );

      if (!testCategory) throw new Error("Unable to find test category month");

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          outflow: "10",
          categoryId: RTACategoryId,
          accountId: testAccount.id,
        })
        .expect(200);

      await compareRTAMonthsToExpected([-10, -10], cookie);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "9.99",
          accountId: testAccount.id,
        })
        .expect(200);

      await compareRTAMonthsToExpected([-10, -10], cookie);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          outflow: "9.99",
          accountId: testAccount.id,
        })
        .expect(200);

      await compareRTAMonthsToExpected([-10, -10], cookie);

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          transactionIds: [await getTransactionId(10, cookie, "outflow")],
        })
        .expect(200);

      await compareRTAMonthsToExpected([0, 0], cookie);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          outflow: "10",
          accountId: testAccount.id,
          categoryId: RTACategoryId,
          date: dateThreeMonthsAgo,
        })
        .expect(200);

      await compareRTAMonthsToExpected([-10, -10, -10, -10, -10], cookie);

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          transactionIds: [await getTransactionId(10, cookie, "outflow")],
        })
        .expect(200);

      await compareRTAMonthsToExpected([0, 0, 0, 0, 0], cookie);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "9.99",
          accountId: testAccount.id,
        })
        .expect(200);

      await compareRTAMonthsToExpected([0, 0, 0, 0, 0], cookie);
    });

    it("Should correctly delete multiple RTA inflow transactions", async () => {
      const RTACategoryId = await getRTACategoryId(cookie);
      const testAccount = await createAccountAndFetch(cookie);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          categoryId: RTACategoryId,
          accountId: testAccount.id,
        })
        .expect(200);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "11",
          categoryId: RTACategoryId,
          accountId: testAccount.id,
        })
        .expect(200);

      await compareRTAMonthsToExpected([21, 21], cookie);

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          transactionIds: [
            await getTransactionId(10, cookie),
            await getTransactionId(11, cookie),
          ],
        })
        .expect(200);

      await compareRTAMonthsToExpected([0, 0], cookie);
    });

    it("Should handle deleting a single categorised transaction - outflow ", async () => {
      const testAccount = await createAccountAndFetch(cookie);
      const testCategoryId = await createTestCategory(cookie);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          outflow: "10",
          categoryId: testCategoryId,
          accountId: testAccount.id,
        })
        .expect(200);

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          transactionIds: [await getTransactionId(10, cookie, "outflow")],
        })
        .expect(200);

      const { months } = await getCategories(cookie);

      const testCategoryMonths = Object.values(months).filter(
        (month) => month.categoryId === testCategoryId
      );

      await compareRTAMonthsToExpected([0, 0], cookie);
      expect(testCategoryMonths[0].activity).toBe(0);
      expect(testCategoryMonths[0].available).toBe(0);
      expect(testCategoryMonths[1].activity).toBe(0);
      expect(testCategoryMonths[1].available).toBe(0);
    });

    it("Should handle deleting a single categorised transaction - inflow ", async () => {
      const testAccount = await createAccountAndFetch(cookie);
      const testCategoryId = await createTestCategory(cookie);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          categoryId: testCategoryId,
          accountId: testAccount.id,
        })
        .expect(200);

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({ transactionIds: [await getTransactionId(10, cookie)] })
        .expect(200);

      const { months } = await getCategories(cookie);

      const testCategoryMonths = Object.values(months).filter(
        (month) => month.categoryId === testCategoryId
      );

      await compareRTAMonthsToExpected([0, 0], cookie);
      expect(testCategoryMonths[0].activity).toBe(0);
      expect(testCategoryMonths[0].available).toBe(0);
      expect(testCategoryMonths[1].activity).toBe(0);
      expect(testCategoryMonths[1].available).toBe(0);
    });

    it("Should handle deleting multiple categorised transaction - inflow ", async () => {
      const testAccount = await createAccountAndFetch(cookie);
      const testCategoryId = await createTestCategory(cookie);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          categoryId: testCategoryId,
          accountId: testAccount.id,
        })
        .expect(200);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "11",
          categoryId: testCategoryId,
          accountId: testAccount.id,
        })
        .expect(200);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "12",
          accountId: testAccount.id,
        })
        .expect(200);

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          transactionIds: [
            await getTransactionId(11, cookie),
            await getTransactionId(10, cookie),
            await getTransactionId(12, cookie),
          ],
        })
        .expect(200);

      const { months } = await getCategories(cookie);

      const testCategoryMonths = Object.values(months).filter(
        (month) => month.categoryId === testCategoryId
      );

      await compareRTAMonthsToExpected([0, 0], cookie);
      expect(testCategoryMonths[0].activity).toBe(0);
      expect(testCategoryMonths[0].available).toBe(0);
      expect(testCategoryMonths[1].activity).toBe(0);
      expect(testCategoryMonths[1].available).toBe(0);
    });

    it("Should handle deleting an inflow and outflow of the same category", async () => {
      const RTACategoryId = await getRTACategoryId(cookie);
      const testAccount = await createAccountAndFetch(cookie);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          categoryId: RTACategoryId,
          accountId: testAccount.id,
        })
        .expect(200);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "11",
          categoryId: RTACategoryId,
          accountId: testAccount.id,
        })
        .expect(200);

      await compareRTAMonthsToExpected([21, 21], cookie);

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          transactionIds: [
            await getTransactionId(10, cookie),
            await getTransactionId(11, cookie),
          ],
        })
        .expect(200);

      await compareRTAMonthsToExpected([0, 0], cookie);
    });

    it("should update RTA for future months when deleting outflow transaction", async () => {
      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          outflow: "10",
          accountId: testAccount.id,
        })
        .expect(200);

      const { transactions } = await getAccounts(cookie);

      const outflowTransaction = Object.values(transactions).find(
        (transaction) => transaction.outflow === 10
      );

      if (!outflowTransaction)
        throw new Error("Unable to find outflow transaction");

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({ transactionIds: [outflowTransaction.id] })
        .expect(200);

      const readyToAssignMonths = await getReadyToAssignMonths(cookie);

      expect(readyToAssignMonths[0].activity).toBe(0);
      expect(readyToAssignMonths[1].activity).toBe(0);
    });
  });

  describe.skip("misc - need sorting", () => {
    it.skip("Should correctly update ready to assign when assigning money to a category", async () => {
      const { categories } = await getCategories(cookie);

      const testCategory = Object.values(categories).find(
        (cat) => cat.name === "test category"
      );

      if (!testCategory) throw new Error("Unable to find test category month");

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "10",
          monthId: testCategory.months[0],
        })
        .expect(200);

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "10",
          monthId: testCategory.months[1],
        })
        .expect(200);

      const expected = [-10, -20];

      compareRTAMonthsToExpected(expected, cookie);
    });

    it.skip("should correctly update ready to assign when adding a transaction assigned to ready to assign when months already assigned", async () => {
      const { categories } = await getCategories(cookie);

      const testCategory = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      );

      if (!testCategory) throw new Error("Unable to find test category month");

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "5",
          monthId: testCategory.months[0],
        })
        .expect(200);

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "5",
          monthId: testCategory.months[1],
        })
        .expect(200);

      await createAccountAndFetch(cookie);
      const { accounts } = await getAccounts(cookie);
      const testAccount = Object.values(accounts).find(
        (account) => account.name === "test account"
      );

      if (!testAccount) throw new Error("Unable to find test account");

      const readyToAssignCategoryId = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      )?.id;

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          accountId: testAccount.id,
          categoryId: readyToAssignCategoryId,
        })
        .expect(200);

      const readyToAssignMonths = await getReadyToAssignMonths(cookie);

      expect(readyToAssignMonths[0].activity).toBe(0);
      expect(readyToAssignMonths[1].activity).toBe(0);
    });

    it.skip("should update ready to assign correctly when updating assign after inflow", async () => {
      await createAccountAndFetch(cookie);

      const { categories } = await getCategories(cookie);

      const testCategory = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      );

      if (!testCategory) throw new Error("Unable to find test category month");

      const { accounts } = await getAccounts(cookie);

      const testAccount = Object.values(accounts).find(
        (account) => account.name === "test account"
      );

      const readyToAssignCategoryId = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      )?.id;

      if (!testAccount) throw new Error("Unable to find test account");

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "100",
          accountId: testAccount.id,
          categoryId: readyToAssignCategoryId,
        })
        .expect(200);

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "50",
          monthId: testCategory.months[0],
        })
        .expect(200);

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "50",
          monthId: testCategory.months[1],
        })
        .expect(200);

      const readyToAssignMonths = await getReadyToAssignMonths(cookie);

      expect(readyToAssignMonths[0].activity).toBe(0);
      expect(readyToAssignMonths[1].activity).toBe(0);
    });

    it.skip("should correctly update ready to assign when setting assigned value in months to zero", async () => {
      await createAccountAndFetch(cookie);

      const { categories } = await getCategories(cookie);

      const testCategory = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      );

      if (!testCategory) throw new Error("Unable to find test category month");

      const { accounts } = await getAccounts(cookie);

      const testAccount = Object.values(accounts).find(
        (account) => account.name === "test account"
      );

      const readyToAssignCategoryId = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      )?.id;

      if (!testAccount) throw new Error("Unable to find test account");

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          accountId: testAccount.id,
          categoryId: readyToAssignCategoryId,
        })
        .expect(200);

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "5",
          monthId: testCategory.months[0],
        })
        .expect(200);

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "5",
          monthId: testCategory.months[1],
        })
        .expect(200);

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "0",
          monthId: testCategory.months[0],
        })
        .expect(200);

      const readyToAssignMonths = await getReadyToAssignMonths(cookie);

      expect(readyToAssignMonths[0].activity).toBe(5);
      expect(readyToAssignMonths[1].activity).toBe(5);
    });

    it.skip("should correctly update ready to assign months in the future when the assigning to the past", async () => {
      await createAccountAndFetch(cookie);

      const { categories } = await getCategories(cookie);

      const { accounts } = await getAccounts(cookie);

      const testAccount = Object.values(accounts).find(
        (account) => account.name === "test account"
      );

      const readyToAssignCategoryId = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      )?.id;

      if (!testAccount) throw new Error("Unable to find test account");

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          accountId: testAccount.id,
          categoryId: readyToAssignCategoryId,
        })
        .expect(200);

      const dateThreeMonthsAgo = new Date();
      dateThreeMonthsAgo.setMonth(dateThreeMonthsAgo.getMonth() - 3);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          outflow: "10",
          accountId: testAccount.id,
          date: dateThreeMonthsAgo,
        })
        .expect(200);

      const { categories: updatedCategories } = await getCategories(cookie);
      const testCategoryUpdated = Object.values(updatedCategories).find(
        (cat) => cat.name === "Ready to Assign"
      );

      if (!testCategoryUpdated) throw new Error("Unable to find test account");

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "5",
          monthId: testCategoryUpdated.months[0],
        })
        .expect(200);

      const readyToAssignMonths = await getReadyToAssignMonths(cookie);

      expect(readyToAssignMonths[0].activity).toBe(-5);
      expect(readyToAssignMonths[1].activity).toBe(-15);
      expect(readyToAssignMonths[2].activity).toBe(-15);
      expect(readyToAssignMonths[3].activity).toBe(-5);
      expect(readyToAssignMonths[4].activity).toBe(-5);
    });

    it.skip("assigned, delete, add - should update RTA correctly when deleting a transaction assigned to RTA", async () => {
      await createAccountAndFetch(cookie);

      const { categories } = await getCategories(cookie);

      const { accounts } = await getAccounts(cookie);

      const testAccount = Object.values(accounts).find(
        (account) => account.name === "test account"
      );

      const readyToAssignCategoryId = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      )?.id;

      if (!testAccount) throw new Error("Unable to find test account");

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          accountId: testAccount.id,
          categoryId: readyToAssignCategoryId,
        })
        .expect(200);

      const { transactions } = await getAccounts(cookie);

      const inflowTransaction = Object.values(transactions).find(
        (transaction) => transaction.inflow === 10
      );

      if (!inflowTransaction)
        throw new Error("Unable to find inflow transaction");

      const { categories: updatedCategories } = await getCategories(cookie);

      const testCategoryUpdated = Object.values(updatedCategories).find(
        (cat) => cat.name === "Ready to Assign"
      );

      if (!testCategoryUpdated) throw new Error("Unable to find test account");

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "10",
          monthId: testCategoryUpdated.months[0],
        })
        .expect(200);

      await request(app)
        .delete("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({ transactionIds: [inflowTransaction.id] })
        .expect(200);

      const readyToAssignMonths = await getReadyToAssignMonths(cookie);

      expect(readyToAssignMonths[0].activity).toBe(-10);
      expect(readyToAssignMonths[1].activity).toBe(-10);
    });

    it.skip("should correctly update RTA when unassigning", async () => {
      await createAccountAndFetch(cookie);

      const { categories } = await getCategories(cookie);

      const testCategory = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      );

      if (!testCategory) throw new Error("Unable to find test category month");

      const { accounts } = await getAccounts(cookie);

      const testAccount = Object.values(accounts).find(
        (account) => account.name === "test account"
      );

      const readyToAssignCategoryId = Object.values(categories).find(
        (cat) => cat.name === "Ready to Assign"
      )?.id;

      if (!testAccount) throw new Error("Unable to find test account");

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          accountId: testAccount.id,
          categoryId: readyToAssignCategoryId,
        })
        .expect(200);

      const dateThreeMonthsAgo = new Date();
      dateThreeMonthsAgo.setMonth(dateThreeMonthsAgo.getMonth() - 3);

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          outflow: "10",
          accountId: testAccount.id,
          date: dateThreeMonthsAgo,
        })
        .expect(200);

      const { categories: updatedCategories } = await getCategories(cookie);
      const testCategoryUpdated = Object.values(updatedCategories).find(
        (cat) => cat.name === "Ready to Assign"
      );

      if (!testCategoryUpdated) throw new Error("Unable to find test account");

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "5",
          monthId: testCategoryUpdated.months[0],
        })
        .expect(200);

      await request(app)
        .patch("/budget/assign")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          assigned: "0",
          monthId: testCategoryUpdated.months[0],
        })
        .expect(200);

      const readyToAssignMonths = await getReadyToAssignMonths(cookie);

      expect(readyToAssignMonths[0].activity).toBe(0);
      expect(readyToAssignMonths[1].activity).toBe(-10);
      expect(readyToAssignMonths[2].activity).toBe(-10);
      expect(readyToAssignMonths[3].activity).toBe(0);
      expect(readyToAssignMonths[4].activity).toBe(0);
    });
  });

  describe.skip("editing transactions", () => {
    it.skip("Should correctly update rta months when editing from uncategorised to category", async () => { });
    it("first test", async () => {
      const { id: accountId } = testAccount;

      await request(app)
        .post("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          inflow: "10",
          memo: "test",
          accountId,
        })
        .expect(200);

      const transaction = await prisma.transaction.findFirstOrThrow({
        where: {
          inflow: "10",
        },
      });

      const payload = {
        transactions: [
          {
            ...transaction,
            categoryId: RTACategoryId,
          },
        ],
      };

      await request(app)
        .patch("/budget/transaction")
        .set("Authorization", `Bearer ${cookie}`)
        .send(payload)
        .expect(200);

      await compareRTAMonthsToExpected([10, 10], cookie);
    });
  });

  describe("Assigning to months", () => {
    it.todo(
      "should prevent user from assigning to uncategorised category months"
    );

    it.todo("should prevent user from assigning to rta category months");

    it.todo("should correctly update the month when assigning");
  });
});
