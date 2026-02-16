import { v4 as uuidv4 } from "uuid";
import { getAccounts, getCategories } from "../../utils/getData";
import {
  addTransaction,
  editBulkTransactions,
  TestEditBulkTransactionsInputWithoutUserId,
  TestInsertTransactionInputWithoutUserId,
} from "../../utils/transaction";
import { login, registerUser } from "../../utils/auth";
import {
  getRTACategory,
  getTestCategory,
  getUncategorisedCategory,
} from "../../utils/category";
import { createAccountAndFetch } from "../../utils/account";

describe("Transaction Bulk Edit", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Error Cases", () => {
    it("Should return 400 if providing an empty transactionIds array", async () => {
      const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
        transactionIds: [],
        updates: {
          categoryId: uuidv4(),
        },
      };
      const { res } = await editBulkTransactions(cookie, editBulkPayload);
      expect(res.status).toBe(400);
    });
    it("Should return 400 if providing empty updates", async () => {
      const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
        transactionIds: [uuidv4()],
        updates: {},
      };
      const { res } = await editBulkTransactions(cookie, editBulkPayload);
      expect(res.status).toBe(400);
    });
    it.each([
      {
        name: "memo + accountId",
        updates: {
          memo: "Lunch",
          accountId: uuidv4(),
        },
      },
      {
        name: "memo + categoryId",
        updates: {
          memo: "Lunch",
          categoryId: uuidv4(),
        },
      },
      {
        name: "accountId + categoryId",
        updates: {
          accountId: uuidv4(),
          categoryId: uuidv4(),
        },
      },
      {
        name: "all three fields",
        updates: {
          memo: "Lunch",
          accountId: uuidv4(),
          categoryId: uuidv4(),
        },
      },
    ])("should return 400 when providing %s", async ({ updates }) => {
      const payload: TestEditBulkTransactionsInputWithoutUserId = {
        transactionIds: [uuidv4()],
        updates,
      };

      const { res } = await editBulkTransactions(cookie, payload);

      expect(res.status).toBe(400);
    });
    it("Should return 404 if a single transactionId is not owned by user", async () => {
      await registerUser({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });

      const cookie2 = await login({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });

      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie2, 0);

      const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
        accountId: account2.id,
        outflow: "10",
      };

      const ownedTx = await addTransaction(cookie, transactionPayloadA);
      const unownedTx = await addTransaction(cookie2, transactionPayloadB);

      const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
        transactionIds: [ownedTx!.id, unownedTx!.id],
        updates: {
          memo: "hello sir",
        },
      };
      const { res } = await editBulkTransactions(cookie, editBulkPayload);
      expect(res.status).toBe(404);
    });
  });

  describe("CategoryId", () => {
    describe("Error Cases", () => {
      it("Should return 400 if categoryId is not a valid uuid", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);

        const transactionPayload: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayload);

        const invalidCategoryId = "not-a-valid-uuid";

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id],
          updates: {
            categoryId: invalidCategoryId,
          },
        };

        const { res } = await editBulkTransactions(cookie, editBulkPayload);

        expect(res.status).toBe(400);
      });
      it("Should return 404 if categoryId is not owned by user", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);

        const transactionPayload: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayload);

        await registerUser({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const cookie2 = await login({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const unownedCategory = await getTestCategory(cookie2);

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id],
          updates: {
            categoryId: unownedCategory.id,
          },
        };

        const { res } = await editBulkTransactions(cookie, editBulkPayload);

        expect(res.status).toBe(404);
      });
      it("Should return 404 if categoryId is not found", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);

        const transactionPayload: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayload);

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id],
          updates: {
            categoryId: uuidv4(),
          },
        };

        const { res } = await editBulkTransactions(cookie, editBulkPayload);

        expect(res.status).toBe(404);
      });
    });
    describe("Success", () => {
      it("Should update categoryId correctly", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);
        const { categories } = await getCategories(cookie);
        const categoryArray = Object.values(categories);
        const category = categoryArray[0];
        const newCategoryId = category.id;

        const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadC: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayloadA, 200);
        const txB = await addTransaction(cookie, transactionPayloadB, 200);
        const txC = await addTransaction(cookie, transactionPayloadC, 200);

        const beforeTxs = [txA!, txB!, txC!];

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id, txB!.id, txC!.id],
          updates: {
            categoryId: newCategoryId,
          },
        };

        await editBulkTransactions(cookie, editBulkPayload);

        const { transactions } = await getAccounts(cookie);
        const updatedTransactions = [txA!.id, txB!.id, txC!.id].map(
          (id) => transactions[id]
        );

        updatedTransactions.forEach((updatedTx, i) => {
          expect(updatedTx.accountId).toBe(beforeTxs[i].accountId);
          expect(updatedTx.categoryId).toBe(newCategoryId);
          expect(updatedTx.transferTransactionId).toBe(
            beforeTxs[i].transferTransactionId
          );
          expect(updatedTx.transferAccountId).toBe(
            beforeTxs[i].transferAccountId
          );
          expect(updatedTx.date).toBe(beforeTxs[i].date);
          expect(updatedTx.outflow).toBe(beforeTxs[i].outflow);
          expect(updatedTx.inflow).toBe(beforeTxs[i].inflow);
          expect(updatedTx.memo).toBe(beforeTxs[i].memo);
        });
      });
    });
    describe("Side Effects", () => {
      it("Should update category months uncategorised -> categorised", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);
        const testCategory = await getTestCategory(cookie);

        const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadC: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadD: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          inflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayloadA, 200);
        const txB = await addTransaction(cookie, transactionPayloadB, 200);
        const txC = await addTransaction(cookie, transactionPayloadC, 200);
        const txD = await addTransaction(cookie, transactionPayloadD, 200);

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id, txB!.id, txC!.id, txD!.id],
          updates: {
            categoryId: testCategory.id,
          },
        };

        await editBulkTransactions(cookie, editBulkPayload);

        const { transactions } = await getAccounts(cookie);
        const updatedTransactions = [txA!.id, txB!.id, txC!.id, txD!.id].map(
          (id) => transactions[id]
        );

        expect(
          updatedTransactions.every((tx) => tx.categoryId === testCategory.id)
        ).toBe(true);

        const { months } = await getCategories(cookie);
        const uncategorisedCategory = await getUncategorisedCategory(cookie);
        const categoryMonths = testCategory.months.map((m) => months[m]);
        const uncategorisedCategoryMonths = uncategorisedCategory.months.map(
          (m) => months[m]
        );

        expect(categoryMonths[0].activity).toBe(-20);
        expect(categoryMonths[0].available).toBe(-20);
        expect(categoryMonths[1].activity).toBe(0);
        expect(categoryMonths[1].available).toBe(0);

        expect(uncategorisedCategoryMonths[0].activity).toBe(0);
        expect(uncategorisedCategoryMonths[0].available).toBe(0);
        expect(uncategorisedCategoryMonths[1].activity).toBe(0);
        expect(uncategorisedCategoryMonths[1].available).toBe(0);
      });
      it("Should update category months uncategorised -> rta", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);

        const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadC: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadD: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          inflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayloadA, 200);
        const txB = await addTransaction(cookie, transactionPayloadB, 200);
        const txC = await addTransaction(cookie, transactionPayloadC, 200);
        const txD = await addTransaction(cookie, transactionPayloadD, 200);

        const uncategorisedCategory = await getUncategorisedCategory(cookie);
        const rtaCategory = await getRTACategory(cookie);

        const { months: monthsBefore } = await getCategories(cookie);
        const uncategorisedCategoryMonthsBefore =
          uncategorisedCategory.months.map((m) => monthsBefore[m]);
        const rtaMonthsBefore = rtaCategory.months.map((m) => monthsBefore[m]);

        expect(uncategorisedCategoryMonthsBefore[0].activity).toBe(-20);
        expect(uncategorisedCategoryMonthsBefore[0].available).toBe(-20);
        expect(uncategorisedCategoryMonthsBefore[1].activity).toBe(0);
        expect(uncategorisedCategoryMonthsBefore[1].available).toBe(0);

        expect(rtaMonthsBefore[0].activity).toBe(0);
        expect(rtaMonthsBefore[0].available).toBe(0);
        expect(rtaMonthsBefore[1].activity).toBe(0);
        expect(rtaMonthsBefore[1].available).toBe(-20);

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id, txB!.id, txC!.id, txD!.id],
          updates: {
            categoryId: rtaCategory.id,
          },
        };

        await editBulkTransactions(cookie, editBulkPayload);

        const { transactions } = await getAccounts(cookie);
        const updatedTransactions = [txA!.id, txB!.id, txC!.id, txD!.id].map(
          (id) => transactions[id]
        );

        expect(
          updatedTransactions.every((tx) => tx.categoryId === rtaCategory.id)
        ).toBe(true);

        const { months } = await getCategories(cookie);
        const rtaMonths = rtaCategory.months.map((m) => months[m]);
        const uncategorisedCategoryMonths = uncategorisedCategory.months.map(
          (m) => months[m]
        );

        expect(rtaMonths[0].activity).toBe(-20);
        expect(rtaMonths[0].available).toBe(-20);
        expect(rtaMonths[1].activity).toBe(0);
        expect(rtaMonths[1].available).toBe(-20);

        expect(uncategorisedCategoryMonths[0].activity).toBe(0);
        expect(uncategorisedCategoryMonths[0].available).toBe(0);
        expect(uncategorisedCategoryMonths[1].activity).toBe(0);
        expect(uncategorisedCategoryMonths[1].available).toBe(0);
      });
    });
    describe("Transfers", () => {
      it("Should not set categoryId on transfer transactions", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);
        const account2 = await createAccountAndFetch(cookie, 0);
        const testCategory = await getTestCategory(cookie);

        const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          transferAccountId: account2.id,
          outflow: "10",
        };
        const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          transferAccountId: account2.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayloadA, 200);
        const txB = await addTransaction(cookie, transactionPayloadB, 200);

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id, txB!.id],
          updates: {
            categoryId: testCategory.id,
          },
        };
        await editBulkTransactions(cookie, editBulkPayload);

        const { transactions: transactionsAfter } = await getAccounts(cookie);
        const { [txA!.id]: updatedTxA, [txB!.id]: updatedTxB } =
          transactionsAfter;
        expect(updatedTxA.categoryId).toBeNull();
        expect(updatedTxB.categoryId).toBeNull();
      });
    });
  });

  describe("AccountId", () => {
    describe("Error Cases", () => {
      it("Should return 400 if accountId is not a uuid", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);

        const transactionPayload: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayload);

        const invalidAccountId = "not-a-valid-uuid";

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id],
          updates: {
            accountId: invalidAccountId,
          },
        };

        const { res } = await editBulkTransactions(cookie, editBulkPayload);

        expect(res.status).toBe(400);
      });
      it("Should return 404 if accountId is not found", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);

        const transactionPayload: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayload);

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id],
          updates: {
            accountId: uuidv4(),
          },
        };

        const { res } = await editBulkTransactions(cookie, editBulkPayload);

        expect(res.status).toBe(404);
      });
      it("Should return 404 if accountId is not owned by user", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);

        const transactionPayload: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayload);

        await registerUser({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const cookie2 = await login({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const account2 = await createAccountAndFetch(cookie2, 0);

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id],
          updates: {
            accountId: account2.id,
          },
        };

        const { res } = await editBulkTransactions(cookie, editBulkPayload);

        expect(res.status).toBe(404);
      });
    });
    describe("Success", () => {
      it("Should update accountId", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);
        const account2 = await createAccountAndFetch(cookie, 0);

        const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadC: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayloadA, 200);
        const txB = await addTransaction(cookie, transactionPayloadB, 200);
        const txC = await addTransaction(cookie, transactionPayloadC, 200);

        const beforeTxs = [txA!, txB!, txC!].map((tx) => ({
          ...tx,
          accountId: undefined,
        }));

        const newAccountId = account2.id;
        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id, txB!.id, txC!.id],
          updates: {
            accountId: newAccountId,
          },
        };

        await editBulkTransactions(cookie, editBulkPayload);

        const { transactions } = await getAccounts(cookie);
        const updatedTransactions = [txA!.id, txB!.id, txC!.id].map(
          (id) => transactions[id]
        );

        updatedTransactions.forEach((updatedTx, i) => {
          expect(updatedTx.accountId).toBe(newAccountId);
          expect(updatedTx.transferTransactionId).toBe(
            beforeTxs[i].transferTransactionId
          );
          expect(updatedTx.transferAccountId).toBe(
            beforeTxs[i].transferAccountId
          );
          expect(updatedTx.date).toBe(beforeTxs[i].date);
          expect(updatedTx.categoryId).toBe(beforeTxs[i].categoryId);
          expect(updatedTx.outflow).toBe(beforeTxs[i].outflow);
          expect(updatedTx.inflow).toBe(beforeTxs[i].inflow);
          expect(updatedTx.memo).toBe(beforeTxs[i].memo);
        });
      });
    });
    describe("Side Effects", () => {
      it("Should update account balance", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);
        const account2 = await createAccountAndFetch(cookie, 0);

        const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const transactionPayloadC: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayloadA, 200);
        const txB = await addTransaction(cookie, transactionPayloadB, 200);
        const txC = await addTransaction(cookie, transactionPayloadC, 200);

        const { accounts: accountsBefore } = await getAccounts(cookie);
        expect(accountsBefore[account1.id].balance).toBe(-30);
        expect(accountsBefore[account2.id].balance).toBe(0);

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id, txB!.id, txC!.id],
          updates: {
            accountId: account2.id,
          },
        };

        await editBulkTransactions(cookie, editBulkPayload);

        const { transactions } = await getAccounts(cookie);
        const updatedTransactions = [txA!.id, txB!.id, txC!.id].map(
          (id) => transactions[id]
        );

        expect(
          updatedTransactions.every((tx) => tx.accountId === account2.id)
        ).toBe(true);

        const { accounts } = await getAccounts(cookie);
        expect(accounts[account1.id].balance).toBe(0);
        expect(accounts[account2.id].balance).toBe(-30);
      });
    });
    describe("Transfers", () => {
      it("Should handle transfer transactions", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);
        const account2 = await createAccountAndFetch(cookie, 0);
        const account3 = await createAccountAndFetch(cookie, 0);

        const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          transferAccountId: account2.id,
          outflow: "10",
        };

        const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          transferAccountId: account2.id,
          outflow: "10",
        };

        const txA = await addTransaction(cookie, transactionPayloadA, 200);
        const txB = await addTransaction(cookie, transactionPayloadB, 200);

        const { accounts: accountsBefore } = await getAccounts(cookie);
        expect(accountsBefore[account1.id].balance).toBe(-20);
        expect(accountsBefore[account2.id].balance).toBe(20);
        expect(accountsBefore[account3.id].balance).toBe(0);

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id, txB!.id],
          updates: {
            accountId: account3.id,
          },
        };
        await editBulkTransactions(cookie, editBulkPayload);

        const { transactions, accounts: accountsAfter } =
          await getAccounts(cookie);
        expect(transactions[txA!.id].accountId).toBe(account3.id);
        expect(transactions[txB!.id].accountId).toBe(account3.id);

        expect(
          transactions[txA!.transferTransactionId!].transferAccountId
        ).toBe(account3.id);
        expect(
          transactions[txB!.transferTransactionId!].transferAccountId
        ).toBe(account3.id);

        expect(accountsAfter[account1.id].balance).toBe(0);
        expect(accountsAfter[account2.id].balance).toBe(20);
        expect(accountsAfter[account3.id].balance).toBe(-20);
      });
      it("Shouldn't do anything if trying to change AccountId of both transactions of a transfer", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);
        const account2 = await createAccountAndFetch(cookie, 0);
        const account3 = await createAccountAndFetch(cookie, 0);

        const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          transferAccountId: account2.id,
          outflow: "10",
        };
        const txA = await addTransaction(cookie, transactionPayloadA, 200);

        const { accounts: accountsBefore, transactions: transactionsBefore } =
          await getAccounts(cookie);

        expect(accountsBefore[account1.id].balance).toBe(-10);
        expect(accountsBefore[account2.id].balance).toBe(10);
        expect(accountsBefore[account3.id].balance).toBe(0);

        const txB = transactionsBefore[txA?.transferTransactionId!];

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id, txB!.id],
          updates: {
            accountId: account3.id,
          },
        };
        await editBulkTransactions(cookie, editBulkPayload);

        const { accounts: accountsAfter, transactions: transactionsAfter } =
          await getAccounts(cookie);
        const updatedTxB = transactionsAfter[txB!.id];
        const updatedTxA = transactionsAfter[txA!.id];

        expect(updatedTxA.accountId).toBe(account1.id);
        expect(updatedTxB.accountId).toBe(account2.id);

        expect(updatedTxA.transferAccountId).toBe(account2.id);
        expect(updatedTxB.transferAccountId).toBe(account1.id);

        expect(updatedTxB.transferTransactionId).toBe(updatedTxA.id);
        expect(updatedTxA.transferTransactionId).toBe(updatedTxB.id);

        expect(accountsAfter[account1.id].balance).toBe(-10);
        expect(accountsAfter[account2.id].balance).toBe(10);
        expect(accountsAfter[account3.id].balance).toBe(0);
      });
      it("Shouldn't do anything if trying to change change AccountId of transfer to the same as transferAccountId", async () => {
        const account1 = await createAccountAndFetch(cookie, 0);
        const account2 = await createAccountAndFetch(cookie, 0);
        const account3 = await createAccountAndFetch(cookie, 0);

        const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
          accountId: account1.id,
          transferAccountId: account2.id,
          outflow: "10",
        };
        const txA = await addTransaction(cookie, transactionPayloadA, 200);

        const { accounts: accountsBefore, transactions: transactionsBefore } =
          await getAccounts(cookie);

        expect(accountsBefore[account1.id].balance).toBe(-10);
        expect(accountsBefore[account2.id].balance).toBe(10);
        expect(accountsBefore[account3.id].balance).toBe(0);

        const txB = transactionsBefore[txA?.transferTransactionId!];

        const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
          transactionIds: [txA!.id],
          updates: {
            accountId: account2.id,
          },
        };
        await editBulkTransactions(cookie, editBulkPayload);

        const { accounts: accountsAfter, transactions: transactionsAfter } =
          await getAccounts(cookie);
        const updatedTxB = transactionsAfter[txB!.id];
        const updatedTxA = transactionsAfter[txA!.id];

        expect(updatedTxA.accountId).toBe(account1.id);
        expect(updatedTxB.accountId).toBe(account2.id);

        expect(updatedTxA.transferAccountId).toBe(account2.id);
        expect(updatedTxB.transferAccountId).toBe(account1.id);

        expect(updatedTxB.transferTransactionId).toBe(updatedTxA.id);
        expect(updatedTxA.transferTransactionId).toBe(updatedTxB.id);

        expect(accountsAfter[account1.id].balance).toBe(-10);
        expect(accountsAfter[account2.id].balance).toBe(10);
        expect(accountsAfter[account3.id].balance).toBe(0);
      });
    });
  });

  describe("Memo", () => {
    it("Should update memo of normal transactions", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);

      const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const transactionPayloadC: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const txA = await addTransaction(cookie, transactionPayloadA, 200);
      const txB = await addTransaction(cookie, transactionPayloadB, 200);
      const txC = await addTransaction(cookie, transactionPayloadC, 200);

      const UPDATED_MEMO = "updated memo";

      const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
        transactionIds: [txA!.id, txB!.id, txC!.id],
        updates: {
          memo: UPDATED_MEMO,
        },
      };

      const beforeTxs = [txA!, txB!, txC!].map((tx) => ({
        ...tx,
        memo: undefined,
      }));

      await editBulkTransactions(cookie, editBulkPayload);

      const { transactions } = await getAccounts(cookie);
      const updatedTransactions = [txA!.id, txB!.id, txC!.id].map(
        (id) => transactions[id]
      );

      updatedTransactions.forEach((updatedTx, i) => {
        expect(updatedTx.accountId).toBe(beforeTxs[i].accountId);
        expect(updatedTx.transferTransactionId).toBe(
          beforeTxs[i].transferTransactionId
        );
        expect(updatedTx.transferAccountId).toBe(
          beforeTxs[i].transferAccountId
        );
        expect(updatedTx.date).toBe(beforeTxs[i].date);
        expect(updatedTx.categoryId).toBe(beforeTxs[i].categoryId);
        expect(updatedTx.outflow).toBe(beforeTxs[i].outflow);
        expect(updatedTx.inflow).toBe(beforeTxs[i].inflow);
        expect(updatedTx.memo).toBe(UPDATED_MEMO);
      });
    });
    it('Should handle " "', async () => {
      const account1 = await createAccountAndFetch(cookie, 0);

      const transactionPayloadA: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const transactionPayloadB: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const transactionPayloadC: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        outflow: "10",
      };

      const txA = await addTransaction(cookie, transactionPayloadA, 200);
      const txB = await addTransaction(cookie, transactionPayloadB, 200);
      const txC = await addTransaction(cookie, transactionPayloadC, 200);

      const UPDATED_MEMO = " ";

      const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
        transactionIds: [txA!.id, txB!.id, txC!.id],
        updates: {
          memo: UPDATED_MEMO,
        },
      };

      const beforeTxs = [txA!, txB!, txC!].map((tx) => ({
        ...tx,
        memo: undefined,
      }));

      await editBulkTransactions(cookie, editBulkPayload);

      const { transactions } = await getAccounts(cookie);
      const updatedTransactions = [txA!.id, txB!.id, txC!.id].map(
        (id) => transactions[id]
      );

      updatedTransactions.forEach((updatedTx, i) => {
        expect(updatedTx.accountId).toBe(beforeTxs[i].accountId);
        expect(updatedTx.transferTransactionId).toBe(
          beforeTxs[i].transferTransactionId
        );
        expect(updatedTx.transferAccountId).toBe(
          beforeTxs[i].transferAccountId
        );
        expect(updatedTx.date).toBe(beforeTxs[i].date);
        expect(updatedTx.categoryId).toBe(beforeTxs[i].categoryId);
        expect(updatedTx.outflow).toBe(beforeTxs[i].outflow);
        expect(updatedTx.inflow).toBe(beforeTxs[i].inflow);
        expect(updatedTx.memo).toBe("");
      });
    });
    it("Should update memo of transfer transactions", async () => {
      const account1 = await createAccountAndFetch(cookie, 0);
      const account2 = await createAccountAndFetch(cookie, 0);

      const transactionPayloadC: TestInsertTransactionInputWithoutUserId = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const tx = await addTransaction(cookie, transactionPayloadC, 200);

      const UPDATED_MEMO = "updated memo";

      const editBulkPayload: TestEditBulkTransactionsInputWithoutUserId = {
        transactionIds: [tx!.id],
        updates: {
          memo: UPDATED_MEMO,
        },
      };

      await editBulkTransactions(cookie, editBulkPayload);

      const { transactions } = await getAccounts(cookie);
      const updatedTx = transactions[tx!.id];
      expect(updatedTx.memo).toBe(UPDATED_MEMO);
      expect(transactions[updatedTx.transferTransactionId!].memo).not.toBe(
        UPDATED_MEMO
      );
    });
  });
});
