import { v4 as uuidv4 } from "uuid";
import { getAccounts, getCategories } from "../../utils/getData";
import { createTestAccount } from "../../utils/createTestAccount";
import { addTransaction, editSingleTransaction } from "../../utils/transaction";
import { login, registerUser } from "../../utils/auth";
import {
  EditSingleTransactionInput,
  TransactionPayload,
} from "../../../features/budget/transaction/transaction.schema";
import {
  getCategoryMonths,
  getRTACategory,
  getRtaMonths,
  getTestCategory,
  getUncategorisedCategory,
} from "../../utils/category";
import { getPayees, getPayeeByName } from "../../utils/payee";

describe("Transaction Single Edit", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
  describe("Error Cases", () => {
    it("Should return 400 when updating a transaction providing no fields", async () => {
      const account1 = await createTestAccount(cookie, 0);

      const transactionPayload: TransactionPayload = {
        accountId: account1.id,
        outflow: "10",
      };

      const newTransaction = await addTransaction(cookie, transactionPayload);

      const editTransactionPayload: EditSingleTransactionInput = {};

      const { res } = await editSingleTransaction(
        cookie,
        newTransaction!.id,
        editTransactionPayload
      );

      expect(res.status).toBe(400);
    });
    it("Should return 400 when updating a transaction providing both transferAccountId and catgoryId", async () => {
      const account1 = await createTestAccount(cookie, 0);

      const transactionPayload: TransactionPayload = {
        accountId: account1.id,
        outflow: "10",
      };

      const newTransaction = await addTransaction(cookie, transactionPayload);

      const editTransactionPayload: EditSingleTransactionInput = {
        transferAccountId: uuidv4(),
        categoryId: uuidv4(),
      };

      const { res } = await editSingleTransaction(
        cookie,
        newTransaction!.id,
        editTransactionPayload
      );

      expect(res.status).toBe(400);
    });
    it("Should return 404 when updating a transaction using an id that doesn't exist", async () => {
      const nonExistentId = uuidv4();

      const editTransactionPayload: EditSingleTransactionInput = {
        memo: "test memo",
      };

      const { res } = await editSingleTransaction(
        cookie,
        nonExistentId,
        editTransactionPayload
      );

      expect(res.status).toBe(404);
    });
    it("Should return 404 when updating a transaction using an id that isn't owned by user", async () => {
      await registerUser({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });

      const cookie2 = await login({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });

      const account2 = await createTestAccount(cookie2, 0);

      const transactionPayload: TransactionPayload = {
        accountId: account2.id,
        outflow: "10",
      };

      const transaction = await addTransaction(
        cookie2,
        transactionPayload,
        200
      );

      const editTransactionPayload: EditSingleTransactionInput = {
        memo: "test memo",
      };

      const { res } = await editSingleTransaction(
        cookie,
        transaction!.id,
        editTransactionPayload
      );

      expect(res.status).toBe(404);
    });
  });
  describe("AccountId", () => {
    describe("Error Cases", () => {
      it("Should return 400 if accountId is not a uuid", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const invalidAccountId = "not-a-valid-uuid";

        const editTransactionPayload: EditSingleTransactionInput = {
          accountId: invalidAccountId,
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(400);
      });
      it("Should return 404 when updating a transaction using an invalid account", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const nonExistentId = uuidv4();

        const editTransactionPayload: EditSingleTransactionInput = {
          accountId: nonExistentId,
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(404);
      });
      it("Should return 404 when editing a transaction using an unowned account", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        await registerUser({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const cookie2 = await login({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const account2 = await createTestAccount(cookie2, 0);

        const editTransactionPayload: EditSingleTransactionInput = {
          accountId: account2.id,
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(404);
      });
    });
    describe("Success", () => {
      it("Should update transaction accountId correctly and update account balance", async () => {
        const account1 = await createTestAccount(cookie, 0);
        const account2 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          accountId: account2.id,
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const { accounts } = await getAccounts(cookie);

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
        expect(updatedTransaction!.accountId).toBe(account2.id);
        expect(updatedTransaction!.categoryId).toBe(newTransaction!.categoryId);
        expect(updatedTransaction!.outflow).toBe(newTransaction!.outflow);
        expect(updatedTransaction!.inflow).toBe(newTransaction!.inflow);
        expect(updatedTransaction!.memo).toBe(newTransaction!.memo);

        expect(accounts[updatedTransaction!.accountId].balance).toBe(-10);
        expect(accounts[account1.id].balance).toBe(0);
      });
    });
  });
  describe("Date", () => {
    describe("Error Cases", () => {
      it("Should return 400 if not iso string", async () => {
        const invalidDates = [
          // date only, no time
          "2026-01-10",
          // US format
          "01/10/2026",
          // invalid month
          "2026-13-01T12:00:00Z",
          "not a date",

          // space instead of T, no offset
          "2026-01-10 14:30:00",
        ];

        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        for (const invalidDate of invalidDates) {
          const { res } = await editSingleTransaction(
            cookie,
            newTransaction!.id,
            { date: invalidDate }
          );

          expect(res.status).toBe(400);
        }
      });
      it("Should prevent changing date to the future", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        // Create a date 1 year in the future
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        const editTransactionPayload: EditSingleTransactionInput = {
          date: futureDate.toISOString(),
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(400);
      });
    });
    describe("Success", () => {
      it("Should update date correctly", async () => {
        const account1 = await createTestAccount(cookie, 0);
        const date = new Date(2025, 6, 15, 1, 0, 0).toISOString();

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);
        const newDate = new Date(new Date(date).getTime() + 1000).toISOString();

        const editTransactionPayload: EditSingleTransactionInput = {
          date: newDate,
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
        expect(updatedTransaction!.date).toEqual(newDate);
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.outflow).toBe(newTransaction!.outflow);
        expect(updatedTransaction!.inflow).toBe(newTransaction!.inflow);
        expect(updatedTransaction!.memo).toBe(newTransaction!.memo);
      });
    });
    describe("Side Effects", () => {
      it("Should correctly add months if date is in the past", async () => {
        const account1 = await createTestAccount(cookie, 0);
        const testCategory = await getTestCategory(cookie);
        const date = new Date(2025, 6, 15, 1, 0, 0).toISOString();

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          categoryId: testCategory.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);
        const pastDate = new Date(date);
        pastDate.setFullYear(pastDate.getFullYear() - 1);
        const newDate = pastDate.toISOString();

        const editTransactionPayload: EditSingleTransactionInput = {
          date: newDate,
        };

        await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const categoryMonths = await getCategoryMonths(cookie, testCategory.id);

        expect(categoryMonths.length).toBe(14);
      });
    });
  });
  describe("Payee", () => {
    describe("Error Cases", () => {
      it("Should return 400 if payeeId is not a uuid", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const invalidPayeeId = "not-a-valid-uuid";

        const editTransactionPayload = {
          payeeId: invalidPayeeId,
        } as any;

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(400);
      });
      it("Should return 400 if both payeeName and payeeId are provided", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const mockPayeeId = uuidv4();

        const editTransactionPayload: EditSingleTransactionInput = {
          payeeId: mockPayeeId,
          payeeName: "Test Payee",
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(400);
      });
      it("Should return 400 if payeeName is \"\" - empty string", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          payeeName: "",
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(400);
      });
      it("Should return 400 if payeeName is \" \" - empty string", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          payeeName: " ",
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(400);
      });
      it("Should return 404 if uuid doesn't correspond to payee", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const nonExistentPayeeId = uuidv4();

        const editTransactionPayload: EditSingleTransactionInput = {
          payeeId: nonExistentPayeeId,
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(404);
      });
      it("Should return 404 if payee is not owned by user", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        await registerUser({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const cookie2 = await login({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const account2 = await createTestAccount(cookie2, 0);

        await addTransaction(cookie2, {
          accountId: account2.id,
          payeeName: "User2 Payee",
          outflow: "10",
        });

        const { payees: payees2 } = await getPayees(cookie2);
        const payeesArray2 = Object.values(payees2);
        const unownedPayee = payeesArray2[0];

        const editTransactionPayload: EditSingleTransactionInput = {
          payeeId: unownedPayee.id,
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(404);
      });
    });
    describe("Success", () => {
      it("Should update payeeId correctly", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload1: TransactionPayload = {
          accountId: account1.id,
          payeeName: "Initial Payee",
          outflow: "10",
        };

        await addTransaction(cookie, transactionPayload1);

        const transactionPayload2: TransactionPayload = {
          accountId: account1.id,
          payeeName: "Second Payee",
          outflow: "10",
        };

        const newTransaction = await addTransaction(
          cookie,
          transactionPayload2
        );

        const { payees: payeesAfter } = await getPayees(cookie);
        const payeesArrayAfter = Object.values(payeesAfter);
        const secondPayee = payeesArrayAfter.find(
          (p) => p.name === "Second Payee"
        )!;

        const editTransactionPayload: EditSingleTransactionInput = {
          payeeId: secondPayee.id,
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
        expect(updatedTransaction!.payeeId).toBe(secondPayee.id);
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.outflow).toBe(newTransaction!.outflow);
        expect(updatedTransaction!.inflow).toBe(newTransaction!.inflow);
        expect(updatedTransaction!.memo).toBe(newTransaction!.memo);
      });
      it("Should update create payee when providing payeeName", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload1: TransactionPayload = {
          accountId: account1.id,
          payeeName: "Initial Payee",
          outflow: "10",
        };

        const transaction = await addTransaction(cookie, transactionPayload1);

        const NEW_PAYEE_NAME = "new payee name";
        const editTransactionPayload: EditSingleTransactionInput = {
          payeeName: NEW_PAYEE_NAME,
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          transaction!.id,
          editTransactionPayload
        );

        const { payees } = await getPayees(cookie);
        const payeeArray = Object.values(payees);
        const payee = payeeArray.find((p) => p.name === NEW_PAYEE_NAME);

        expect(updatedTransaction).toBeDefined();
        expect(payee).toBeDefined();
        expect(updatedTransaction!.payeeId).toBe(payee!.id);
      });
      it("Should clear payeeId if providing null", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          payeeName: "Test Payee",
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        expect(newTransaction!.payeeId).not.toBeNull();

        const editTransactionPayload: EditSingleTransactionInput = {
          payeeId: null,
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
        expect(updatedTransaction!.payeeId).toBeNull();
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.outflow).toBe(newTransaction!.outflow);
        expect(updatedTransaction!.inflow).toBe(newTransaction!.inflow);
        expect(updatedTransaction!.memo).toBe(newTransaction!.memo);
      });
    });
    describe("Side Effects", () => {
      it("If a new payee is provided, create entry", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        // Verify no payees exist initially
        const { payees: payeesBefore } = await getPayees(cookie);
        expect(Object.values(payeesBefore).length).toBe(0);

        const NEW_PAYEE_NAME = "New Test Payee";
        const editTransactionPayload: EditSingleTransactionInput = {
          payeeName: NEW_PAYEE_NAME,
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        // Verify payee was created
        const { payees: payeesAfter } = await getPayees(cookie);
        const payeesArray = Object.values(payeesAfter);
        expect(payeesArray.length).toBe(1);

        const createdPayee = await getPayeeByName(cookie, NEW_PAYEE_NAME);
        expect(createdPayee.name).toBe(NEW_PAYEE_NAME);

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.payeeId).toBe(createdPayee.id);
      });
    });
  });
  describe("CategoryId", () => {
    describe("Error Cases", () => {
      it("Should return 400 if categoryId is not a uuid", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const invalidCategoryId = "not-a-valid-uuid";

        const editTransactionPayload = {
          categoryId: invalidCategoryId,
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(400);
      });
      it("Should return 404 when updating a transaction using a nonexistent categoryId", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const nonExistentId = uuidv4();

        const editTransactionPayload: EditSingleTransactionInput = {
          categoryId: nonExistentId,
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(404);
      });
      it("Should return 404 when editing a transaction using an unowned categoryId", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        await registerUser({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const cookie2 = await login({
          email: "testa@test.com",
          password: "testpasswordABC$",
        });

        const category2 = await getTestCategory(cookie2);

        const editTransactionPayload: EditSingleTransactionInput = {
          categoryId: category2.id,
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(404);
      });
    });
    describe("Success", () => {
      it("Should update category id correctly", async () => {
        const account1 = await createTestAccount(cookie, 0);
        const { categories } = await getCategories(cookie);
        const categoryArray = Object.values(categories);
        const category = categoryArray[0];

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          categoryId: category.id,
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.categoryId).toBe(category.id);
        expect(updatedTransaction!.outflow).toBe(newTransaction!.outflow);
        expect(updatedTransaction!.inflow).toBe(newTransaction!.inflow);
        expect(updatedTransaction!.memo).toBe(newTransaction!.memo);
      });
      it("Should set categoryId to uncategorised categoryId when categoryId = null", async () => {
        const account1 = await createTestAccount(cookie, 0);
        const { categories } = await getCategories(cookie);
        const categoryArray = Object.values(categories);
        const category = categoryArray[0];
        const uncategorisedCategory = await getUncategorisedCategory(cookie);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          categoryId: category.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          categoryId: null,
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
        expect(updatedTransaction!.categoryId).toBe(uncategorisedCategory.id);
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.outflow).toBe(newTransaction!.outflow);
        expect(updatedTransaction!.inflow).toBe(newTransaction!.inflow);
        expect(updatedTransaction!.memo).toBe(newTransaction!.memo);
      });
    });
    describe("Side Effects", () => {
      it("Should correctly update rta months when updating from test category to rta category", async () => {
        const account1 = await createTestAccount(cookie, 0);
        const rtaCategory = await getRTACategory(cookie);
        const testCategory = await getTestCategory(cookie);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          categoryId: testCategory.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          categoryId: rtaCategory.id,
        };

        await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const testMonths = await getCategoryMonths(cookie, testCategory.id);
        expect(testMonths[0].activity).toBe(0);
        expect(testMonths[0].available).toBe(0);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(0);

        const rtaMonths = await getRtaMonths(cookie);
        expect(rtaMonths[0].activity).toBe(-10);
        expect(rtaMonths[0].available).toBe(-10);
        expect(rtaMonths[1].activity).toBe(0);
        expect(rtaMonths[1].available).toBe(-10);
      });
      it("Should correctly update category months when updating from rta category to test category", async () => {
        const account1 = await createTestAccount(cookie, 0);
        const rtaCategory = await getRTACategory(cookie);
        const testCategory = await getTestCategory(cookie);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          categoryId: rtaCategory.id,
          inflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          categoryId: testCategory.id,
        };

        await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const rtaMonths = await getRtaMonths(cookie);
        expect(rtaMonths[0].activity).toBe(0);
        expect(rtaMonths[0].available).toBe(0);

        expect(rtaMonths[1].activity).toBe(0);
        expect(rtaMonths[1].available).toBe(0);

        const testMonths = await getCategoryMonths(cookie, testCategory.id);
        expect(testMonths[0].activity).toBe(10);
        expect(testMonths[0].available).toBe(10);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(10);
      });
      it("Should correctly update category months when updating outflow from uncategorised category to test category", async () => {
        const account1 = await createTestAccount(cookie, 0);
        const uncategorisedCategory = await getUncategorisedCategory(cookie);
        const testCategory = await getTestCategory(cookie);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          categoryId: uncategorisedCategory.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          categoryId: testCategory.id,
        };

        await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const uncategorisedMonths = await getCategoryMonths(
          cookie,
          uncategorisedCategory.id
        );
        expect(uncategorisedMonths[0].activity).toBe(0);
        expect(uncategorisedMonths[0].available).toBe(0);
        expect(uncategorisedMonths[1].activity).toBe(0);
        expect(uncategorisedMonths[1].available).toBe(0);

        const testMonths = await getCategoryMonths(cookie, testCategory.id);
        expect(testMonths[0].activity).toBe(-10);
        expect(testMonths[0].available).toBe(-10);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(0);
      });
      it("Should correctly update category months when updating inflow from uncategorised category to test category", async () => {
        const account1 = await createTestAccount(cookie, 0);
        const uncategorisedCategory = await getUncategorisedCategory(cookie);
        const testCategory = await getTestCategory(cookie);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          categoryId: uncategorisedCategory.id,
          inflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          categoryId: testCategory.id,
        };

        await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const uncategorisedMonths = await getCategoryMonths(
          cookie,
          uncategorisedCategory.id
        );
        expect(uncategorisedMonths[0].activity).toBe(0);
        expect(uncategorisedMonths[0].available).toBe(0);
        expect(uncategorisedMonths[1].activity).toBe(0);
        expect(uncategorisedMonths[1].available).toBe(0);

        const testMonths = await getCategoryMonths(cookie, testCategory.id);
        expect(testMonths[0].activity).toBe(10);
        expect(testMonths[0].available).toBe(10);
        expect(testMonths[1].activity).toBe(0);
        expect(testMonths[1].available).toBe(10);
      });
    });
  });
  describe("Memo Months", () => {
    describe("Error Cases", () => {
      it("Should return 400 if memo is over 100 characters", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const longMemo = "a".repeat(101);

        const editTransactionPayload: EditSingleTransactionInput = {
          memo: longMemo,
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.status).toBe(400);
      });
    });
    describe("Success", () => {
      it("Should update transaction memo correctly", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          memo: "updated memo",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.memo).toBe("updated memo");
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.outflow).toBe(newTransaction!.outflow);
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
      });
      it('Should handle transaction memo when providing " "', async () => {
        // should set memo to "" - an empty string
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          memo: " ",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.memo).toBe("");
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.outflow).toBe(newTransaction!.outflow);
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
      });
      it.skip("Should clear memo correctly", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          memo: "updated memo",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.memo).toBe("updated memo");
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.outflow).toBe(newTransaction!.outflow);
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
      });
    });
  });
  describe("Inflow/Outflow", () => {
    describe("Error cases", () => {
      it("Should return 400 if providing both inflow + outflow", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          outflow: "20",
          inflow: "20",
        };

        const { res } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        expect(res.statusCode).toBe(400);
      });
    });
    describe("Success", () => {
      it("Should update inflow/outflow correctly", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          outflow: "20",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );
        const { accounts } = await getAccounts(cookie);

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.outflow).toBe(20);
        expect(updatedTransaction!.inflow).toBe(0);
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.id).toBe(newTransaction!.id);

        expect(accounts[updatedTransaction!.accountId].balance).toBe(-20);
      });
      it.skip("Should update outflow -> 0 correctly", async () => {
        // should not allow anymore
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          outflow: "0",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );
        const { accounts } = await getAccounts(cookie);

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.outflow).toBe(0);
        expect(updatedTransaction!.inflow).toBe(0);
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
        expect(accounts[updatedTransaction!.accountId].balance).toBe(0);
      });
      it.skip("Should update inflow -> 0 correctly", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          inflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          inflow: "0",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );
        const { accounts } = await getAccounts(cookie);

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.outflow).toBe(0);
        expect(updatedTransaction!.inflow).toBe(0);
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
        expect(accounts[updatedTransaction!.accountId].balance).toBe(0);
      });
      it.todo("Should handle outflow -> inflow");
      it.skip("Should update outflow -> inflow 0 correctly", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          inflow: "0",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );
        const { accounts } = await getAccounts(cookie);

        expect(updatedTransaction).toBeDefined();
        expect(updatedTransaction!.outflow).toBe(0);
        expect(updatedTransaction!.inflow).toBe(0);
        expect(updatedTransaction!.accountId).toBe(newTransaction!.accountId);
        expect(updatedTransaction!.id).toBe(newTransaction!.id);
        expect(accounts[updatedTransaction!.accountId].balance).toBe(0);
      });
    });
    describe("Account", () => {
      it("Should correctly update account balance when updating outflow -> outflow", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          outflow: "20",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const { accounts } = await getAccounts(cookie);

        expect(accounts[updatedTransaction!.accountId].balance).toBe(-20);
      });
      it("Should correctly update account balance when updating inflow -> inflow", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          inflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          inflow: "20",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const { accounts } = await getAccounts(cookie);

        expect(accounts[updatedTransaction!.accountId].balance).toBe(20);
      });
      it("Should correctly update account balance when updating outflow -> inflow", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          outflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          inflow: "20",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const { accounts } = await getAccounts(cookie);

        expect(accounts[updatedTransaction!.accountId].balance).toBe(20);
      });
      it("Should correctly update account balance when updating inflow -> outflow", async () => {
        const account1 = await createTestAccount(cookie, 0);

        const transactionPayload: TransactionPayload = {
          accountId: account1.id,
          inflow: "10",
        };

        const newTransaction = await addTransaction(cookie, transactionPayload);

        const editTransactionPayload: EditSingleTransactionInput = {
          outflow: "10",
        };

        const { updatedTransaction } = await editSingleTransaction(
          cookie,
          newTransaction!.id,
          editTransactionPayload
        );

        const { accounts } = await getAccounts(cookie);

        expect(accounts[updatedTransaction!.accountId].balance).toBe(-10);
      });
    });
    describe("Category months", () => {
      describe("RTA", () => {
        it("Should correctly update rta months when updating inflow -> inflow", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const rtaCategory = await getRTACategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: rtaCategory.id,
            inflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            inflow: "20",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const rtaMonths = await getRtaMonths(cookie);
          expect(rtaMonths[0].activity).toBe(20);
          expect(rtaMonths[0].available).toBe(20);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(20);
        });
        it("Should correctly update rta months when updating outflow -> outflow", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const rtaCategory = await getRTACategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: rtaCategory.id,
            outflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            outflow: "20",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const rtaMonths = await getRtaMonths(cookie);
          expect(rtaMonths[0].activity).toBe(-20);
          expect(rtaMonths[0].available).toBe(-20);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(-20);
        });
        it("Should correctly update rta months when updating inflow -> outflow", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const rtaCategory = await getRTACategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: rtaCategory.id,
            inflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            outflow: "20",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const rtaMonths = await getRtaMonths(cookie);
          expect(rtaMonths[0].activity).toBe(-20);
          expect(rtaMonths[0].available).toBe(-20);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(-20);
        });
        it("Should correctly update rta months when updating outflow -> inflow", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const rtaCategory = await getRTACategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: rtaCategory.id,
            outflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            inflow: "20",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const rtaMonths = await getRtaMonths(cookie);
          expect(rtaMonths[0].activity).toBe(20);
          expect(rtaMonths[0].available).toBe(20);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(20);
        });
        it.skip("Should correctly update rta months when updating outflow -> 0", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const rtaCategory = await getRTACategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: rtaCategory.id,
            outflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            outflow: "0",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const rtaMonths = await getRtaMonths(cookie);
          expect(rtaMonths[0].activity).toBe(0);
          expect(rtaMonths[0].available).toBe(0);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(0);
        });
        it.skip("Should correctly update rta months when updating inflow -> 0", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const rtaCategory = await getRTACategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: rtaCategory.id,
            inflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            inflow: "0",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const rtaMonths = await getRtaMonths(cookie);
          expect(rtaMonths[0].activity).toBe(0);
          expect(rtaMonths[0].available).toBe(0);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(0);
        });
      });
      describe("Category", () => {
        it("Should correctly update category months when updating inflow -> inflow", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const testCategory = await getTestCategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: testCategory.id,
            inflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            inflow: "20",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const testCategoryMonths = await getCategoryMonths(
            cookie,
            testCategory.id
          );

          expect(testCategoryMonths[0].activity).toBe(20);
          expect(testCategoryMonths[0].available).toBe(20);

          expect(testCategoryMonths[1].activity).toBe(0);
          expect(testCategoryMonths[1].available).toBe(20);
        });
        it("Should correctly update category months when updating outflow -> outflow", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const testCategory = await getTestCategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: testCategory.id,
            outflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            outflow: "20",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const testCategoryMonths = await getCategoryMonths(
            cookie,
            testCategory.id
          );

          expect(testCategoryMonths[0].activity).toBe(-20);
          expect(testCategoryMonths[0].available).toBe(-20);

          expect(testCategoryMonths[1].activity).toBe(0);
          expect(testCategoryMonths[1].available).toBe(0);

          const rtaMonths = await getRtaMonths(cookie);

          expect(rtaMonths[0].activity).toBe(0);
          expect(rtaMonths[0].available).toBe(0);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(-20);
        });
        it("Should correctly update category months when updating outflow -> inflow", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const testCategory = await getTestCategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: testCategory.id,
            outflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            inflow: "20",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const testCategoryMonths = await getCategoryMonths(
            cookie,
            testCategory.id
          );

          expect(testCategoryMonths[0].activity).toBe(20);
          expect(testCategoryMonths[0].available).toBe(20);

          expect(testCategoryMonths[1].activity).toBe(0);
          expect(testCategoryMonths[1].available).toBe(20);

          const rtaMonths = await getRtaMonths(cookie);

          expect(rtaMonths[0].activity).toBe(0);
          expect(rtaMonths[0].available).toBe(0);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(0);
        });
        it("Should correctly update category months when updating inflow -> outflow", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const testCategory = await getTestCategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: testCategory.id,
            inflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            outflow: "20",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const testCategoryMonths = await getCategoryMonths(
            cookie,
            testCategory.id
          );

          expect(testCategoryMonths[0].activity).toBe(-20);
          expect(testCategoryMonths[0].available).toBe(-20);

          expect(testCategoryMonths[1].activity).toBe(0);
          expect(testCategoryMonths[1].available).toBe(0);

          const rtaMonths = await getRtaMonths(cookie);

          expect(rtaMonths[0].activity).toBe(0);
          expect(rtaMonths[0].available).toBe(0);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(-20);
        });
        it.skip("Should correctly update category months when updating inflow -> 0", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const testCategory = await getTestCategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: testCategory.id,
            inflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            inflow: "0",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const testCategoryMonths = await getCategoryMonths(
            cookie,
            testCategory.id
          );

          expect(testCategoryMonths[0].activity).toBe(0);
          expect(testCategoryMonths[0].available).toBe(0);

          expect(testCategoryMonths[1].activity).toBe(0);
          expect(testCategoryMonths[1].available).toBe(0);

          const rtaMonths = await getRtaMonths(cookie);

          expect(rtaMonths[0].activity).toBe(0);
          expect(rtaMonths[0].available).toBe(0);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(0);
        });
        it.skip("Should correctly update category months when updating outflow -> 0", async () => {
          const account1 = await createTestAccount(cookie, 0);

          const testCategory = await getTestCategory(cookie);

          const transactionPayload: TransactionPayload = {
            accountId: account1.id,
            categoryId: testCategory.id,
            outflow: "10",
          };

          const newTransaction = await addTransaction(
            cookie,
            transactionPayload
          );

          const editTransactionPayload: EditSingleTransactionInput = {
            outflow: "0",
          };

          await editSingleTransaction(
            cookie,
            newTransaction!.id,
            editTransactionPayload
          );

          const testCategoryMonths = await getCategoryMonths(
            cookie,
            testCategory.id
          );

          expect(testCategoryMonths[0].activity).toBe(0);
          expect(testCategoryMonths[0].available).toBe(0);

          expect(testCategoryMonths[1].activity).toBe(0);
          expect(testCategoryMonths[1].available).toBe(0);

          const rtaMonths = await getRtaMonths(cookie);

          expect(rtaMonths[0].activity).toBe(0);
          expect(rtaMonths[0].available).toBe(0);

          expect(rtaMonths[1].activity).toBe(0);
          expect(rtaMonths[1].available).toBe(0);
        });
      });
    });
  });

  describe("Transfers", () => {
    it("Should handle removing transferAccountId deleting the paired transfer tx and updating balances", async () => {
      const account1 = await createTestAccount(cookie, 0);
      const account2 = await createTestAccount(cookie, 0);

      const transactionPayload: TransactionPayload = {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
      };

      const newTransaction = await addTransaction(cookie, transactionPayload);

      const { transactions } = await getAccounts(cookie);
      const main = transactions[newTransaction!.id];
      expect(main).toBeDefined();
      expect(main.transferTransactionId).toBeTruthy();

      const pairedId = main.transferTransactionId!;
      expect(transactions[pairedId]).toBeDefined();

      const editTransactionPayload: EditSingleTransactionInput = {
        transferAccountId: null,
      };

      const { res } = await editSingleTransaction(
        cookie,
        newTransaction!.id,
        editTransactionPayload
      );

      expect(res.status).toBe(200);

      const { accounts, transactions: txsAfter } = await getAccounts(cookie);
      expect(txsAfter[pairedId]).toBeUndefined();
      expect(txsAfter[newTransaction!.id]).toBeDefined();
      expect(txsAfter[newTransaction!.id].transferAccountId).toBeNull();
      expect(txsAfter[newTransaction!.id].transferTransactionId).toBeNull();

      expect(accounts[account1.id].balance).toBe(-10);
      expect(accounts[account2.id].balance).toBe(0);
    });
    it("Should convert a normal transaction into a transfer (creates paired tx, links both, updates balances)", async () => {
      const accountFrom = await createTestAccount(cookie, 0);
      const accountTo = await createTestAccount(cookie, 0);

      const transactionPayload: TransactionPayload = {
        accountId: accountFrom.id,
        outflow: "10",
        memo: "normal-to-transfer",
      };

      const created = await addTransaction(cookie, transactionPayload);

      {
        const { transactions } = await getAccounts(cookie);
        const mainBefore = transactions[created!.id];
        expect(mainBefore).toBeDefined();
        expect(mainBefore.transferAccountId).toBeNull();
        expect(mainBefore.transferTransactionId).toBeNull();
      }

      const editTransactionPayload: EditSingleTransactionInput = {
        transferAccountId: accountTo.id,
      };

      const { res } = await editSingleTransaction(
        cookie,
        created!.id,
        editTransactionPayload
      );

      expect(res.status).toBe(200);

      const { accounts, transactions } = await getAccounts(cookie);

      const mainAfter = transactions[created!.id];
      expect(mainAfter).toBeDefined();

      expect(mainAfter.transferAccountId).toBe(accountTo.id);
      expect(mainAfter.transferTransactionId).toBeTruthy();

      const pairedId = mainAfter.transferTransactionId!;
      const paired = transactions[pairedId];

      expect(paired).toBeDefined();
      expect(paired.accountId).toBe(accountTo.id);

      expect(paired.transferAccountId).toBe(accountFrom.id);
      expect(paired.transferTransactionId).toBe(mainAfter.id);

      expect(mainAfter.outflow).toBe(10);
      expect(mainAfter.inflow).toBe(0);

      expect(paired.inflow).toBe(10);
      expect(paired.outflow).toBe(0);

      expect(accounts[accountFrom.id].balance).toBe(-10);
      expect(accounts[accountTo.id].balance).toBe(10);
    });

    it("Should change a transfer from account B to account C (deletes old paired, creates new paired, updates balances)", async () => {
      const accountA = await createTestAccount(cookie, 0);
      const accountB = await createTestAccount(cookie, 0);
      const accountC = await createTestAccount(cookie, 0);

      const created = await addTransaction(cookie, {
        accountId: accountA.id,
        transferAccountId: accountB.id,
        outflow: "10",
        memo: "transfer-A-to-B",
      });

      const { accounts: accountsBefore, transactions: txsBefore } =
        await getAccounts(cookie);
      const mainBefore = txsBefore[created!.id];
      expect(mainBefore).toBeDefined();
      expect(mainBefore.transferAccountId).toBe(accountB.id);
      expect(mainBefore.transferTransactionId).toBeTruthy();

      const oldPairedId = mainBefore.transferTransactionId!;
      const oldPaired = txsBefore[oldPairedId];
      expect(oldPaired).toBeDefined();
      expect(oldPaired.accountId).toBe(accountB.id);

      expect(accountsBefore[accountA.id].balance).toBe(-10);
      expect(accountsBefore[accountB.id].balance).toBe(10);
      expect(accountsBefore[accountC.id].balance).toBe(0);

      const { res } = await editSingleTransaction(cookie, created!.id, {
        transferAccountId: accountC.id,
      });

      expect(res.status).toBe(200);

      const { accounts: accountsAfter, transactions: txsAfter } =
        await getAccounts(cookie);

      expect(txsAfter[oldPairedId]).toBeUndefined();

      const mainAfter = txsAfter[created!.id];
      expect(mainAfter).toBeDefined();
      expect(mainAfter.transferAccountId).toBe(accountC.id);
      expect(mainAfter.transferTransactionId).toBeTruthy();
      expect(mainAfter.transferTransactionId).not.toBe(oldPairedId);

      const newPairedId = mainAfter.transferTransactionId!;
      const newPaired = txsAfter[newPairedId];
      expect(newPaired).toBeDefined();
      expect(newPaired.accountId).toBe(accountC.id);

      expect(newPaired.transferAccountId).toBe(accountA.id);
      expect(newPaired.transferTransactionId).toBe(mainAfter.id);

      expect(accountsAfter[accountA.id].balance).toBe(-10);
      expect(accountsAfter[accountB.id].balance).toBe(0);
      expect(accountsAfter[accountC.id].balance).toBe(10);
    });
    it("Should convert a transfer into a normal transaction (deletes paired, clears links) and then allow category/month updates", async () => {
      const account1 = await createTestAccount(cookie, 0);
      const account2 = await createTestAccount(cookie, 0);
      const testCategory = await getTestCategory(cookie);

      // Create transfer
      const created = await addTransaction(cookie, {
        accountId: account1.id,
        transferAccountId: account2.id,
        outflow: "10",
        memo: "transfer-to-normal",
      });

      const { transactions: txsBefore } = await getAccounts(cookie);
      const mainBefore = txsBefore[created!.id];
      expect(mainBefore).toBeDefined();
      expect(mainBefore.transferAccountId).toBe(account2.id);
      expect(mainBefore.transferTransactionId).toBeTruthy();

      const pairedId = mainBefore.transferTransactionId!;
      expect(txsBefore[pairedId]).toBeDefined();

      // remove transfer
      const { res } = await editSingleTransaction(cookie, created!.id, {
        transferAccountId: null,
        categoryId: testCategory.id,
      });

      expect(res.status).toBe(200);

      const { accounts: accountsAfterRemove, transactions: txsAfterRemove } =
        await getAccounts(cookie);

      // paired deleted and main cleared
      expect(txsAfterRemove[pairedId]).toBeUndefined();

      const mainAfterRemove = txsAfterRemove[created!.id];
      expect(mainAfterRemove).toBeDefined();
      expect(mainAfterRemove.transferAccountId).toBeNull();
      expect(mainAfterRemove.transferTransactionId).toBeNull();

      // balances: account1 still has the -10 (it is now just a normal outflow txn)
      expect(accountsAfterRemove[account1.id].balance).toBe(-10);
      expect(accountsAfterRemove[account2.id].balance).toBe(0);

      const testMonths = await getCategoryMonths(cookie, testCategory.id);
      const rtaMonths = await getRtaMonths(cookie);

      // The activity should reflect the outflow (-10) in the correct month
      // (You might need to pick the right index depending on how you order months)
      expect(testMonths[0].activity).toBe(-10);
      expect(rtaMonths[0].available).toBe(0);
      expect(rtaMonths[1].available).toBe(-10);
    });

    describe("Date", () => {
      describe("Side Effects", () => {
        describe("Memo Months", () => {
          it("Should backfill memo months when editing a transfer transaction into the past", async () => {
            const { memoByMonth: before, monthKeys: beforeKeys } =
              await getCategories(cookie);

            expect(Object.keys(before)).toHaveLength(LENGTH_ON_SIGNUP);

            const existingKey = beforeKeys[0];
            expect(existingKey).toBeDefined();
            const existingId = before[existingKey].id;

            const fromAccount = await createTestAccount(cookie, 0);
            const toAccount = await createTestAccount(cookie, 0);

            const created = await addTransaction(cookie, {
              accountId: fromAccount.id,
              transferAccountId: toAccount.id,
              outflow: "10",
            });

            const { transactions: txsBefore } = await getAccounts(cookie);
            const mainBefore = txsBefore[created!.id];
            expect(mainBefore).toBeDefined();
            expect(mainBefore.transferAccountId).toBe(toAccount.id);
            expect(mainBefore.transferTransactionId).toBeTruthy();

            const now = new Date();
            const past = new Date(
              Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 10, 1)
            );
            const pastDate = past.toISOString();
            const pastKey = pastDate.slice(0, 7);

            expect(before[pastKey]).toBeUndefined();

            const { res } = await editSingleTransaction(cookie, created!.id, {
              date: pastDate,
            });
            expect(res.status).toBe(200);

            const { memoByMonth: after, monthKeys: afterKeys } =
              await getCategories(cookie);

            expect(after[pastKey]).toBeDefined();

            expect(after[existingKey].id).toBe(existingId);

            expect(Object.keys(after).sort()).toEqual([...afterKeys].sort());
          });
        });
        describe("Category Months", () => {
          it.skip("Should backfill category months when editing a transfer transaction into the past", async () => { });
        });
      });
    });
  });
  describe("Transfers - stress tests", () => {
    it("Normal edit (account + date (past) + payee + category (normal -> rta) + memo + outflow -> outflow) updates balances + months + fields", async () => {
      const accountA = await createTestAccount(cookie, 0);
      const accountB = await createTestAccount(cookie, 0);
      // for payee seed
      const accountC = await createTestAccount(cookie, 0);

      const testCategory = await getTestCategory(cookie);
      const rtaCategory = await getRTACategory(cookie);

      // Seed a payee we can switch to - will be uncategorised
      await addTransaction(cookie, {
        accountId: accountC.id,
        outflow: "1",
        payeeName: "Target Payee",
      });

      const { payees } = await getPayees(cookie);
      const targetPayee = Object.values(payees).find(
        (p) => p.name === "Target Payee"
      )!;
      expect(targetPayee).toBeDefined();

      // Create initial normal tx
      const created = await addTransaction(cookie, {
        accountId: accountA.id,
        categoryId: testCategory.id,
        outflow: "10",
        memo: "seed",
        payeeName: "Seed Payee",
      });

      // June 2025
      const newDate = new Date(2025, 5, 10, 12, 0, 0).toISOString();

      const editPayload: EditSingleTransactionInput = {
        // new account
        accountId: accountB.id,
        // new date in past
        date: newDate,
        // new payee
        payeeId: targetPayee.id,
        // new category - rta
        categoryId: rtaCategory.id,
        // new memo
        memo: "updated memo",
        // new outflow
        outflow: "25",
      };

      const { res, updatedTransaction } = await editSingleTransaction(
        cookie,
        created!.id,
        editPayload
      );

      expect(res.status).toBe(200);
      expect(updatedTransaction).toBeDefined();

      // Fields asserted
      expect(updatedTransaction!.id).toBe(created!.id);
      expect(updatedTransaction!.accountId).toBe(accountB.id);
      expect(updatedTransaction!.date).toBe(newDate);
      expect(updatedTransaction!.payeeId).toBe(targetPayee.id);
      expect(updatedTransaction!.categoryId).toBe(rtaCategory.id);
      expect(updatedTransaction!.memo).toBe("updated memo");
      expect(updatedTransaction!.outflow).toBe(25);
      expect(updatedTransaction!.inflow).toBe(0);

      // Balances asserted
      const { accounts } = await getAccounts(cookie);
      expect(accounts[accountA.id].balance).toBe(0);
      expect(accounts[accountB.id].balance).toBe(-25);

      const rtaCatMonths = await getCategoryMonths(cookie, rtaCategory.id);
      expect(rtaCatMonths.length).toBeGreaterThan(0);

      const rtaCatMostRecentMonth = rtaCatMonths[rtaCatMonths.length - 1];
      // the payee seed + the updated rta outflow
      expect(rtaCatMostRecentMonth.available).toBe(-26);

      // check that all uncategorised months are 0
      const unCatMonths = await getCategoryMonths(cookie, testCategory.id);
      unCatMonths.forEach((m) => {
        expect(m.activity).toBe(0);
        expect(m.available).toBe(0);
        expect(m.assigned).toBe(0);
      });
    });
    it("Transfer edit (account + date (past) + payee(ignored) + memo + outflow -> outflow ) updates balances + both sides, months unchanged, ignores payee", async () => {
      const accountA = await createTestAccount(cookie, 0);
      const accountB = await createTestAccount(cookie, 0);
      // for payee seed
      const accountC = await createTestAccount(cookie, 0);

      // move transfer transaction to this account
      const accountD = await createTestAccount(cookie, 0);

      // initial transaction
      const initialTx = await addTransaction(cookie, {
        accountId: accountA.id,
        transferAccountId: accountB.id,
        outflow: "10",
        memo: "seed-transfer",
      });

      const { transactions: txsBefore } = await getAccounts(cookie);
      const txBefore = txsBefore[initialTx!.id];
      expect(txBefore).toBeDefined();
      expect(txBefore.transferTransactionId).toBeTruthy();
      const pairedId = txBefore.transferTransactionId!;
      expect(txsBefore[pairedId]).toBeDefined();

      // Snapshot months for a normal category; transfers must not affect months
      const testCategory = await getTestCategory(cookie);
      const monthsBefore = await getCategoryMonths(cookie, testCategory.id);

      // Seed a payee - will be ignored because its a transfer transactions
      await addTransaction(cookie, {
        accountId: accountC.id,
        outflow: "1",
        payeeName: "Transfer Target Payee",
      });
      const { payees } = await getPayees(cookie);
      const targetPayee = Object.values(payees).find(
        (p) => p.name === "Transfer Target Payee"
      )!;
      expect(targetPayee).toBeDefined();

      // June 2025
      const newDate = new Date(2025, 7, 20, 9, 30, 0).toISOString();

      const editPayload: EditSingleTransactionInput = {
        // new account
        accountId: accountD.id,
        // new date
        date: newDate,
        // new memo
        memo: "transfer updated",
        // new outflow
        outflow: "30",
        // this should be ignored because its a transfer transaction
        payeeId: targetPayee.id,
      };

      const { res } = await editSingleTransaction(
        cookie,
        initialTx!.id,
        editPayload
      );
      expect(res.status).toBe(200);

      const { accounts, transactions: txsAfter } = await getAccounts(cookie);

      const txAfter = txsAfter[initialTx!.id];
      expect(txAfter).toBeDefined();
      expect(txAfter.transferTransactionId).toBe(pairedId);

      const pairedAfter = txsAfter[pairedId];
      expect(pairedAfter).toBeDefined();

      // Main updated
      expect(txAfter.date).toBe(newDate);
      expect(txAfter.memo).toBe("transfer updated");
      expect(txAfter.outflow).toBe(30);
      expect(txAfter.inflow).toBe(0);
      expect(txAfter.payeeId).toBeNull();

      // Paired mirrored
      expect(pairedAfter.date).toBe(newDate);
      expect(pairedAfter.memo).toBe("transfer updated");
      expect(pairedAfter.inflow).toBe(30);
      expect(pairedAfter.outflow).toBe(0);
      expect(pairedAfter.payeeId).toBeNull();

      // Balances correct
      expect(accounts[accountA.id].balance).toBe(0);
      expect(accounts[accountB.id].balance).toBe(30);
      expect(accounts[accountD.id].balance).toBe(-30);

      // Months unchanged
      const monthsAfter = await getCategoryMonths(cookie, testCategory.id);

      const stable = (months: typeof monthsAfter) =>
        months.map((m) => ({
          month: m.month,
          activity: m.activity,
          assigned: m.assigned,
          available: m.available,
        }));

      const before = stable(monthsBefore);
      const after = stable(monthsAfter);

      // All months that existed before are unchanged
      const afterForExisting = after.filter((m) =>
        before.some((b) => b.month === m.month)
      );

      expect(afterForExisting).toEqual(before);

      // All newly inserted months are strictly earlier than the earliest previous month
      const earliestBeforeMonth = before[0].month;

      const inserted = after.filter(
        (m) => !before.some((b) => b.month === m.month)
      );

      for (const m of inserted) {
        expect(new Date(m.month).getTime()).toBeLessThan(
          new Date(earliestBeforeMonth).getTime()
        );
      }
      expect(after.length).toBe(before.length + inserted.length);
    });
    it("Transfer edit (transferAccountId, outflow -> inflow) updates balances + both sides, months unchanged", async () => {
      const accountA = await createTestAccount(cookie, 0);
      const accountB = await createTestAccount(cookie, 0);
      // for payee seed
      const accountC = await createTestAccount(cookie, 0);

      // account to move transfer tx to
      const accountD = await createTestAccount(cookie, 0);

      // initial transaction
      const created = await addTransaction(cookie, {
        accountId: accountA.id,
        transferAccountId: accountB.id,
        outflow: "10",
        memo: "seed-transfer",
      });

      const { transactions: txsBefore } = await getAccounts(cookie);
      const txBefore = txsBefore[created!.id];
      expect(txBefore).toBeDefined();
      expect(txBefore.transferTransactionId).toBeTruthy();
      const pairedId = txBefore.transferTransactionId!;
      expect(txsBefore[pairedId]).toBeDefined();

      // Snapshot months for a normal category; transfers must not affect months
      const testCategory = await getTestCategory(cookie);
      const monthsBefore = await getCategoryMonths(cookie, testCategory.id);

      // Seed a payee - will be ignored because its a transfer transactions
      await addTransaction(cookie, {
        accountId: accountC.id,
        outflow: "1",
        payeeName: "Transfer Target Payee",
      });
      const { payees } = await getPayees(cookie);
      const targetPayee = Object.values(payees).find(
        (p) => p.name === "Transfer Target Payee"
      )!;
      expect(targetPayee).toBeDefined();

      // June 2025
      const newDate = new Date(2025, 7, 20, 9, 30, 0).toISOString();

      const editPayload: EditSingleTransactionInput = {
        // new account
        accountId: accountD.id,
        // new date
        date: newDate,
        // new memo
        memo: "transfer updated",
        // new inflow
        inflow: "30",
        // this should be ignored because its a transfer transaction
        payeeId: targetPayee.id,
      };

      const { res } = await editSingleTransaction(
        cookie,
        created!.id,
        editPayload
      );
      expect(res.status).toBe(200);

      const { accounts, transactions: txsAfter } = await getAccounts(cookie);

      const mainTxAfter = txsAfter[created!.id];
      expect(mainTxAfter).toBeDefined();
      expect(mainTxAfter.transferTransactionId).toBe(pairedId);

      const pairedTxAfter = txsAfter[pairedId];
      expect(pairedTxAfter).toBeDefined();

      // Main updated
      expect(mainTxAfter.date).toBe(newDate);
      expect(mainTxAfter.memo).toBe("transfer updated");
      expect(mainTxAfter.outflow).toBe(0);
      expect(mainTxAfter.inflow).toBe(30);
      expect(mainTxAfter.payeeId).toBeNull();

      // Paired mirrored
      expect(pairedTxAfter.date).toBe(newDate);
      expect(pairedTxAfter.memo).toBe("transfer updated");
      expect(pairedTxAfter.inflow).toBe(0);
      expect(pairedTxAfter.outflow).toBe(30);
      expect(pairedTxAfter.payeeId).toBeNull();

      // Balances correct
      expect(accounts[accountA.id].balance).toBe(0);
      expect(accounts[accountB.id].balance).toBe(-30);
      expect(accounts[accountD.id].balance).toBe(30);

      // Months unchanged
      const monthsAfter = await getCategoryMonths(cookie, testCategory.id);

      const stable = (months: typeof monthsAfter) =>
        months.map((m) => ({
          month: m.month,
          activity: m.activity,
          assigned: m.assigned,
          available: m.available,
        }));

      const before = stable(monthsBefore);
      const after = stable(monthsAfter);

      // All months that existed before are unchanged
      const afterForExisting = after.filter((m) =>
        before.some((b) => b.month === m.month)
      );

      expect(afterForExisting).toEqual(before);

      // All newly inserted months are strictly earlier than the earliest previous month
      const earliestBeforeMonth = before[0].month;

      const inserted = after.filter(
        (m) => !before.some((b) => b.month === m.month)
      );

      for (const m of inserted) {
        expect(new Date(m.month).getTime()).toBeLessThan(
          new Date(earliestBeforeMonth).getTime()
        );
      }
      expect(after.length).toBe(before.length + inserted.length);
    });
    it("Create normal transaction, convert to transfer, convert back to normal, is the same", async () => {
      const accountA = await createTestAccount(cookie, 0);
      const accountB = await createTestAccount(cookie, 0);
      // for payee seed
      const accountC = await createTestAccount(cookie, 0);

      // account to move transfer tx to
      const accountD = await createTestAccount(cookie, 0);

      // initial transaction
      const created = await addTransaction(cookie, {
        accountId: accountA.id,
        outflow: "10",
        memo: "seed-transfer",
      });

      const { transactions: txsBefore } = await getAccounts(cookie);
      const txBefore = txsBefore[created!.id];
      expect(txBefore).toBeDefined();
      expect(txBefore.transferTransactionId).toBeFalsy();

      // Seed a payee
      await addTransaction(cookie, {
        accountId: accountC.id,
        outflow: "1",
        payeeName: "Transfer Target Payee",
      });
      const { payees } = await getPayees(cookie);
      const targetPayee = Object.values(payees).find(
        (p) => p.name === "Transfer Target Payee"
      )!;
      expect(targetPayee).toBeDefined();

      // June 2025
      const newDate = new Date(2025, 7, 20, 9, 30, 0).toISOString();

      const editPayloadA: EditSingleTransactionInput = {
        // new account
        accountId: accountD.id,
        //turn into a transfer
        transferAccountId: accountB.id,
        // new date
        date: newDate,
        // new memo
        memo: "transfer updated",
        // new inflow
        inflow: "10.01",
        // this should be ignored because its a transfer transaction
        payeeId: targetPayee.id,
      };

      const { res: resA } = await editSingleTransaction(
        cookie,
        created!.id,
        editPayloadA
      );
      expect(resA.status).toBe(200);

      const { accounts: accountsAfterA, transactions: txsAfterA } =
        await getAccounts(cookie);

      const mainTxAfterA = txsAfterA[created!.id];
      expect(mainTxAfterA).toBeDefined();
      expect(mainTxAfterA.transferTransactionId).toBeDefined();

      const pairedTxAfterA = txsAfterA[mainTxAfterA.transferTransactionId!];
      expect(pairedTxAfterA).toBeDefined();

      // Main updated
      expect(mainTxAfterA.date).toBe(newDate);
      expect(mainTxAfterA.memo).toBe("transfer updated");
      expect(mainTxAfterA.outflow).toBe(0);
      expect(mainTxAfterA.inflow).toBe(10.01);
      expect(mainTxAfterA.payeeId).toBeNull();

      // Paired mirrored
      expect(pairedTxAfterA.date).toBe(newDate);
      expect(pairedTxAfterA.memo).toBe("transfer updated");
      expect(pairedTxAfterA.inflow).toBe(0);
      expect(pairedTxAfterA.outflow).toBe(10.01);
      expect(pairedTxAfterA.payeeId).toBeNull();

      // Balances correct
      expect(accountsAfterA[accountA.id].balance).toBe(0);
      expect(accountsAfterA[accountB.id].balance).toBe(-10.01);
      expect(accountsAfterA[accountD.id].balance).toBe(10.01);

      const testCategory = await getTestCategory(cookie);
      const nowISOString = new Date().toISOString();
      const editPayloadB: EditSingleTransactionInput = {
        //turn into a normal transfer
        transferAccountId: null,
        // new category
        categoryId: testCategory.id,
        // change date to now
        date: nowISOString,
        // new memo
        memo: "change to normal",
        // this should applied - its a normal transaction
        payeeId: targetPayee.id,
      };

      const { res: resB } = await editSingleTransaction(
        cookie,
        created!.id,
        editPayloadB
      );
      expect(resB.status).toBe(200);

      const { accounts: accountsAfterB, transactions: txsAfterB } =
        await getAccounts(cookie);

      const mainTxAfterB = txsAfterB[created!.id];
      expect(mainTxAfterB).toBeDefined();
      expect(mainTxAfterB.transferTransactionId).toBeNull();
      expect(txsAfterB[pairedTxAfterA.id]).toBeUndefined();

      // Main updated - now a normal tx
      expect(mainTxAfterB.date).toBe(nowISOString);
      expect(mainTxAfterB.payeeId).toBe(targetPayee.id);
      expect(mainTxAfterB.categoryId).toBe(testCategory.id);
      expect(mainTxAfterB.memo).toBe("change to normal");
      expect(mainTxAfterB.outflow).toBe(0);
      expect(mainTxAfterB.inflow).toBe(10.01);

      // Balances correct
      expect(accountsAfterB[accountA.id].balance).toBe(0);
      expect(accountsAfterB[accountB.id].balance).toBe(0);
      expect(accountsAfterB[accountD.id].balance).toBe(10.01);
    });
  });
});
