import request from "supertest";
import { v4 as uuidv4 } from "uuid";
import app from "../../../app";
import { getAccounts, getCategories } from "../../utils/getData";
import { createTestAccount } from "../../utils/createTestAccount";
import { addTransaction } from "../../utils/transaction";
import { login, registerUser } from "../../utils/auth";
import { TransactionPayload } from "../../../features/budget/transaction/transaction.schema";

describe("Transaction Create", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Error Cases", () => {
    it("Should return 401 when adding a transaction without logging in", async () => {
      const testTransaction = {
        outflow: 10,
      };

      const res = await request(app)
        .post("/budget/transaction")
        .send(testTransaction);

      expect(res.status).toBe(401);
    });
    it("Should return 400 when adding a transaction with a transferAccountId and a categoryId", async () => {
      const userAccount = await createTestAccount(cookie);

      const transaction: TransactionPayload = {
        accountId: userAccount.id,
        categoryId: uuidv4(),
        transferAccountId: uuidv4(),
        outflow: "10",
        date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
      };

      await addTransaction(cookie, transaction, 400);
    });
    it("Should return 400 when adding a transaction a memo over 100 characters", async () => {
      const userAccount = await createTestAccount(cookie);

      const transaction: TransactionPayload = {
        accountId: userAccount.id,
        outflow: "10",
        date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
        memo: "a".repeat(101),
      };

      await addTransaction(cookie, transaction, 400);
    });
    it('Should return 400 when adding a transaction with "" as payeeName', async () => {
      const userAccount = await createTestAccount(cookie);

      const transaction: TransactionPayload = {
        accountId: userAccount.id,
        payeeName: "",
        outflow: "10",
        date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
      };

      await addTransaction(cookie, transaction, 400);
    });
    it('Should return 400 when adding a transaction with " " as payeeName', async () => {
      const userAccount = await createTestAccount(cookie);

      const transaction: TransactionPayload = {
        accountId: userAccount.id,
        payeeName: " ",
        outflow: "10",
        date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
      };

      await addTransaction(cookie, transaction, 400);
    });
    it("Should return 400 when creating a normal transaction older than the 12-month window", async () => {
      const account = await createTestAccount(cookie, 0);

      const now = new Date();
      // Too old = first day of the month, 12 months ago (UTC)
      // Earliest allowed is month-11 => month-12 is outside.
      const tooOld = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1)
      );

      const payload: TransactionPayload = {
        accountId: account.id,
        outflow: "10",
        date: tooOld.toISOString(),
      };

      await addTransaction(cookie, payload, 400);
    });
    it("Should return 404 when adding a transaction to an account not owned by the user", async () => {
      await registerUser({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });

      const cookie2 = await login({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });
      const unownedAccount = await createTestAccount(cookie2);

      const transactionPayload: TransactionPayload = {
        accountId: unownedAccount.id,
        outflow: "10",
      };

      await addTransaction(cookie, transactionPayload, 404);
    });
  });
  describe("Bugs", () => {
    it.skip("Should allow transactions added at 1am", async () => {
      const account = await createTestAccount(cookie);

      jest.useFakeTimers();
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      jest.setSystemTime(fixedDate);

      const transactionDate = new Date(2025, 6, 15, 1, 0, 0);

      await request(app)
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
  });

  describe("Non-Transfers", () => {
    describe("Success", () => {
      it("Should assign transaction to uncategorised when adding a transaction with no category", async () => {
        const account = await createTestAccount(cookie);

        await request(app)
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
      it("Should allow creating a transaction on the earliest allowed month boundary", async () => {
        const account = await createTestAccount(cookie, 0);

        const now = new Date();
        const earliestAllowed = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1)
        );

        await addTransaction(
          cookie,
          {
            accountId: account.id,
            outflow: "10",
            date: earliestAllowed.toISOString(),
          },
          200
        );
      });
    });
    describe("Error Cases", () => {
      it.todo("Should return error when user doesn't own category");
      it("Should return 400 when adding a transaction with no account", async () => {
        const testTransaction = {
          outflow: "10",
          memo: "test tx",
        };

        await request(app)
          .post("/budget/transaction")
          .set("Authorization", `Bearer ${cookie}`)
          .send(testTransaction)
          .expect(400);
      });

      it("Should return 400 when adding a transaction without inflow or outflow", async () => {
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
    describe("Side Effects", () => {
      describe("Memo Months", () => {
        it("Should backfill memo months inserting a normal transaction in the past", async () => {
          const { memoByMonth: memoByMonthBefore, monthKeys: monthKeysBefore } =
            await getCategories(cookie);

          expect(Object.keys(memoByMonthBefore).length).toBe(LENGTH_ON_SIGNUP);
          const existingKey = monthKeysBefore[0];
          const existingId = memoByMonthBefore[existingKey].id;

          const account = await createTestAccount(cookie);

          const now = new Date();
          const past = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 10, 1)
          );
          const pastDate = past.toISOString();
          const pastKey = pastDate.slice(0, 7);

          const transactionPayload: TransactionPayload = {
            accountId: account.id,
            date: pastDate,
            outflow: "10",
          };

          await addTransaction(cookie, transactionPayload);

          const { memoByMonth: memoByMonthAfter, monthKeys: monthKeysAfter } =
            await getCategories(cookie);

          expect(memoByMonthAfter[pastKey]).toBeDefined();

          expect(memoByMonthAfter[existingKey].id).toBe(existingId);

          expect(monthKeysAfter).toHaveLength(12);
        });
        it("Should return 500 invariant error if there is no existing memos", async () => {
          const account = await createTestAccount(cookie);

          // Break the invariant (delete memos)
          await prisma.monthMemo.deleteMany({});
          const count = await prisma.monthMemo.count();
          expect(count).toBe(0);

          const now = new Date();
          const past = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 10, 1)
          );

          await addTransaction(
            cookie,
            {
              accountId: account.id,
              date: past.toISOString(),
              outflow: "10",
            },
            500
          );
        });
      });
      describe("Category Months", () => {
        it("Should create months when adding a transaction in the past", async () => {
          const account = await createTestAccount(cookie);

          const { months: monthsBefore } = await getCategories(cookie);

          const beforeMonthSet = new Set(
            Object.values(monthsBefore).map((m) => m.month)
          );
          expect(beforeMonthSet.size).toBe(2);

          const now = new Date();
          const past = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 10, 1)
          );
          const pastDate = past.toISOString();

          const transferTransaction: TransactionPayload = {
            accountId: account.id,
            outflow: "10",
            date: pastDate,
          };

          await addTransaction(cookie, transferTransaction, 200);

          const { months: monthsAfter } = await getCategories(cookie);

          const afterMonthSet = new Set(
            Object.values(monthsAfter).map((m) => m.month)
          );
          expect(afterMonthSet.size).toBe(12);
        });
      });
    });
  });

  describe("Transfers", () => {
    describe("Validation", () => {
      it("Should return 400 when providing both payeeId and transferAccountId", async () => {
        const userAccount = await createTestAccount(cookie);
        const mockPayeeId = "550e8400-e29b-41d4-a716-446655440000";

        const transaction: TransactionPayload = {
          accountId: userAccount.id,
          payeeId: mockPayeeId,
          transferAccountId: userAccount.id,
          outflow: "10",
          date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
        };

        await addTransaction(cookie, transaction, 400);
      });

      it("Should return 400 when providing both payeeName and transferAccountId", async () => {
        const userAccount = await createTestAccount(cookie);

        const transaction: TransactionPayload = {
          accountId: userAccount.id,
          payeeName: "test payee",
          transferAccountId: userAccount.id,
          outflow: "10",
          date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
        };

        await addTransaction(cookie, transaction, 400);
      });

      it("Should return 400 when providing both transferAccountId and categoryId", async () => {
        const userAccount = await createTestAccount(cookie);

        const { categories } = await getCategories(cookie);
        const category = Object.values(categories)[0];

        const transaction: TransactionPayload = {
          accountId: userAccount.id,
          categoryId: category.id,
          transferAccountId: userAccount.id,
          outflow: "10",
          date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
        };

        await addTransaction(cookie, transaction, 400);
      });

      it("Should return 400 when trying to transfer to same account", async () => {
        const userAccount = await createTestAccount(cookie);

        const transferTransaction: TransactionPayload = {
          accountId: userAccount.id,
          outflow: "10",
          date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
          transferAccountId: userAccount.id,
        };

        await addTransaction(cookie, transferTransaction, 400);
      });
      it("Should return 400 when creating a transfer transaction older than the 12-month window", async () => {
        const from = await createTestAccount(cookie, 0);
        const to = await createTestAccount(cookie, 0);

        const now = new Date();
        const tooOld = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1)
        );

        const payload: TransactionPayload = {
          accountId: from.id,
          transferAccountId: to.id,
          outflow: "10",
          date: tooOld.toISOString(),
        };

        await addTransaction(cookie, payload, 400);
      });
    });

    describe("Authorization", () => {
      it("Should return 404 When adding a transfer from an account not owned by the user", async () => {
        const userAccount = await createTestAccount(cookie);
        await registerUser({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const cookie2 = await login({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });
        const unownedAccount = await createTestAccount(cookie2);

        const transactionPayload: TransactionPayload = {
          accountId: unownedAccount.id,
          transferAccountId: userAccount.id,
          outflow: "10",
        };

        await addTransaction(cookie, transactionPayload, 404);
      });
      it("Should return 404 when trying to transfer to unowned account", async () => {
        const user = {
          email: "test1@test.com",
          password: "testpasswordABC$",
        };
        await registerUser(user);
        const cookie2 = await login(user);

        const userAccount = await createTestAccount(cookie);

        const unownedAccount = await createTestAccount(cookie2);

        const transaction: TransactionPayload = {
          accountId: userAccount.id,
          inflow: "10",
          date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
        };

        await addTransaction(cookie, transaction, 200);

        const transferTransaction: TransactionPayload = {
          accountId: userAccount.id,
          outflow: "10",
          transferAccountId: unownedAccount.id,
          date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
        };

        await addTransaction(cookie, transferTransaction, 404);
      });
    });

    describe("Success", () => {
      it("Should successfully transfer between two accounts", async () => {
        const account1 = await createTestAccount(cookie, 100);
        const account2 = await createTestAccount(cookie, 50);

        const transferTransaction: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
          transferAccountId: account2.id,
          date: new Date(2025, 6, 15, 1, 0, 0).toISOString(),
        };

        await addTransaction(cookie, transferTransaction, 200);

        // Verify account balances updated correctly
        const { accounts, transactions } = await getAccounts(cookie);

        const updatedAccount1 = accounts[account1.id];
        const updatedAccount2 = accounts[account2.id];

        expect(updatedAccount1.balance).toBe(90); // 100 - 10
        expect(updatedAccount2.balance).toBe(60); // 50 + 10

        // Verify two transfer transactions were created
        const transactionArray = Object.values(transactions);
        const transferTransactions = transactionArray.filter(
          (t) => t.transferAccountId !== null
        );

        expect(transferTransactions).toHaveLength(2);

        // Verify source transaction
        const sourceTransaction = transferTransactions.find(
          (t) => t.accountId === account1.id
        );

        expect(sourceTransaction).toBeDefined();
        expect(sourceTransaction?.outflow).toBe(10);
        expect(sourceTransaction?.inflow).toBe(0);
        expect(sourceTransaction?.categoryId).toBeNull();

        // Verify destination transaction
        const destinationTransaction = transferTransactions.find(
          (t) => t.accountId === account2.id
        );

        expect(destinationTransaction).toBeDefined();
        expect(destinationTransaction?.inflow).toBe(10);
        expect(destinationTransaction?.outflow).toBe(0);
        expect(destinationTransaction?.categoryId).toBeNull();

        expect(sourceTransaction!.transferTransactionId).toBe(
          destinationTransaction!.id
        );

        expect(destinationTransaction!.transferTransactionId).toBe(
          sourceTransaction!.id
        );
      });
    });
    describe("Side Effects", () => {
      describe("Memo Months", () => {
        it("Should backfill memo months inserting a transfer transaction in the past", async () => {
          const { memoByMonth: before, monthKeys: beforeKeys } =
            await getCategories(cookie);

          expect(Object.keys(before)).toHaveLength(LENGTH_ON_SIGNUP);

          const existingKey = beforeKeys[0];
          expect(existingKey).toBeDefined();
          const existingId = before[existingKey].id;

          // Need two accounts for a transfer
          const fromAccount = await createTestAccount(cookie);
          const toAccount = await createTestAccount(cookie);

          const now = new Date();
          const past = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 10, 1)
          );
          const pastDate = past.toISOString();
          const pastKey = pastDate.slice(0, 7);

          expect(before[pastKey]).toBeUndefined();

          const transferPayload: TransactionPayload = {
            accountId: fromAccount.id,
            transferAccountId: toAccount.id,
            date: pastDate,
            outflow: "10",
          };

          await addTransaction(cookie, transferPayload);

          const { memoByMonth: after, monthKeys: afterKeys } =
            await getCategories(cookie);

          expect(after[pastKey]).toBeDefined();
          expect(after[existingKey].id).toBe(existingId);

          expect(afterKeys).toHaveLength(12);
          expect(Object.keys(after)).toHaveLength(12);
        });
      });

      describe("Category Months", () => {
        it("Should create category months when adding a transfer transaction in the past", async () => {
          const account1 = await createTestAccount(cookie);
          const account2 = await createTestAccount(cookie);

          const { months: monthsBefore } = await getCategories(cookie);

          const beforeMonthSet = new Set(
            Object.values(monthsBefore).map((m) => m.month)
          );
          expect(beforeMonthSet.size).toBe(2);

          const now = new Date();
          const past = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 10, 1)
          );
          const pastDate = past.toISOString();

          const transferTransactionPayload: TransactionPayload = {
            accountId: account1.id,
            outflow: "10",
            transferAccountId: account2.id,
            date: pastDate,
          };

          await addTransaction(cookie, transferTransactionPayload);

          const { months: monthsAfter } = await getCategories(cookie);

          const afterMonthSet = new Set(
            Object.values(monthsAfter).map((m) => m.month)
          );
          expect(afterMonthSet.size).toBe(12);
        });
      });
    });
  });
});
