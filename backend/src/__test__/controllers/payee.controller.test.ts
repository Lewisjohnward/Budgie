import { registerUser } from "../utils/auth";
import { addTransaction } from "../utils/transaction";
import {
  getPayees,
  editPayee,
  deletePayees,
  DeletePayeesPayloadWithoutUserId,
  combinePayees,
  CombinePayeesPayloadWithoutUserId,
  EditPayeesPayloadWithoutUserId,
  editPayees,
} from "../utils/payee";
import { getAccounts, getCategories } from "../utils/getData";
import { login } from "../utils/auth";
import { createTestAccount } from "../utils/createTestAccount";
import request from "supertest";
import app from "../../app";

const PAYEE_NAME = "testPayee";

describe("Payee", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Create", () => {
    it("Should create payee when adding transaction with payeeName", async () => {
      const account = await createTestAccount(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);

      expect(payeesArray.length).toBe(1);
    });

    it("Should create payee with default settings when adding transaction with new payeeName", async () => {
      const account = await createTestAccount(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      const { payees } = await getPayees(cookie);
      const { transactions } = await getAccounts(cookie);
      const payeesArray = Object.values(payees);
      const testPayee = payeesArray[0];
      const transactionArray = Object.values(transactions);
      const testTransaction = transactionArray[0];

      expect(payeesArray.length).toBe(1);
      expect(testPayee.name).toBe(PAYEE_NAME);
      expect(testPayee.defaultCategoryId).toBeNull();
      expect(testPayee.includeInPayeeList).toBe(true);
      expect(testPayee.automaticallyCategorisePayee).toBe(true);
      expect(new Date(testPayee.createdAt).getTime()).toBeGreaterThan(0);
      expect(testPayee.createdAt).toBe(testPayee.updatedAt);
      expect(transactionArray.length).toBe(1);
      expect(testTransaction.payeeId).toBe(testPayee.id);
    });

    it("Should trim whitespace from payeeName when creating a payee", async () => {
      const account = await createTestAccount(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: "   " + PAYEE_NAME + "   ",
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);
      const testPayee = payeesArray[0];
      expect(testPayee.name).toBe(PAYEE_NAME);
    });

    it("Should return 409 if user sends payeeName that already exists", async () => {
      const account = await createTestAccount(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      await addTransaction(cookie, transaction, 409);
    });

    it("Should return 400 if user sends payeeName and payeeId", async () => {
      const account = await createTestAccount(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        payeeId: "123e4567-e89b-12d3-a456-426614174000",
        outflow: "10",
      };

      await addTransaction(cookie, transaction, 400);
    });
    it("Should return 400 if user sends payeeName as empty string", async () => {
      const account = await createTestAccount(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: "   ",
        outflow: "10",
      };

      await addTransaction(cookie, transaction, 400);
    });
    it("Should return 400 if payeeName exceeds maximum length", async () => {
      const account = await createTestAccount(cookie);

      const longPayeeName = "A".repeat(51);

      const transaction = {
        accountId: account.id,
        payeeName: longPayeeName,
        outflow: "10",
      };

      await addTransaction(cookie, transaction, 400);
    });

    it("Should create payee with minimum name length of 1 character", async () => {
      const account = await createTestAccount(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: "A",
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);
      const testPayee = payeesArray[0];

      expect(payeesArray.length).toBe(1);
      expect(testPayee.name).toBe("A");
    });

    it("Should handle concurrent duplicate payee creates (race condition)", async () => {
      const account = await createTestAccount(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: "Concurrent Payee",
        outflow: "10",
      };

      // Fire off 5 concurrent requests trying to create the same payee
      const promises = Array(5)
        .fill(null)
        .map(() =>
          request(app)
            .post("/budget/transaction")
            .set("Authorization", `Bearer ${cookie}`)
            .send(transaction)
        );

      const results = await Promise.allSettled(promises);

      // Exactly one should succeed (200)
      const succeeded = results.filter(
        (r) => r.status === "fulfilled" && r.value?.status === 200
      );
      expect(succeeded).toHaveLength(1);

      // Others should fail with 409 (PayeeAlreadyExistsError)
      const failed = results.filter(
        (r) => r.status === "fulfilled" && r.value?.status === 409
      );
      expect(failed.length).toBeGreaterThan(0);

      // Verify only one payee was created
      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);
      const concurrentPayees = payeesArray.filter(
        (p) => p.name === "Concurrent Payee"
      );
      expect(concurrentPayees).toHaveLength(1);
    });
  });

  describe("Linkage", () => {
    it("Should create payee with id that links to transaction", async () => {
      const account = await createTestAccount(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      const { payees } = await getPayees(cookie);
      const { transactions } = await getAccounts(cookie);
      const payeesArray = Object.values(payees);
      const testPayee = payeesArray[0];
      const transactionArray = Object.values(transactions);
      const testTransaction = transactionArray[0];

      expect(testTransaction.payeeId).toBe(testPayee.id);
    });

    it("Should link transaction to existing payee when payeeId is provided", async () => {
      const account = await createTestAccount(cookie);

      const transaction1 = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };
      await addTransaction(cookie, transaction1);

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);
      const testPayee = payeesArray[0];
      const transaction2 = {
        accountId: account.id,
        payeeId: testPayee.id,
        outflow: "20",
      };
      await addTransaction(cookie, transaction2);

      const { transactions } = await getAccounts(cookie);
      const transactionArray = Object.values(transactions);

      expect(transactionArray.length).toBe(2);
      expect(transactionArray[0].payeeId).toBe(testPayee.id);
      expect(transactionArray[1].payeeId).toBe(testPayee.id);
    });

    it("Should return 404 if user doesn't own payeeId - adding tx", async () => {
      await createTestAccount(cookie);

      const { accounts } = await getAccounts(cookie);
      const accountsArray = Object.values(accounts);
      const testAccount = accountsArray[0];
      const transaction = {
        accountId: testAccount.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      const user = {
        email: "test2@test.com",
        password: "testpasswordABC$",
      };
      await registerUser(user);
      const cookie2 = await login(user);

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);
      const testPayee = payeesArray[0];
      await createTestAccount(cookie2);

      const { accounts: accounts2 } = await getAccounts(cookie2);
      const accountsArray2 = Object.values(accounts2);
      const testAccount2 = accountsArray2[0];
      const transaction2 = {
        accountId: testAccount2.id,
        payeeId: testPayee.id,
        outflow: "10",
      };
      await addTransaction(cookie2, transaction2, 404);
    });
  });

  describe("Read", () => {
    it("Should return all payees for user and not include other users' payees", async () => {
      const account = await createTestAccount(cookie);

      const transaction1 = {
        accountId: account.id,
        payeeName: "Payee One",
        outflow: "10",
      };
      const transaction2 = {
        accountId: account.id,
        payeeName: "Payee Two",
        outflow: "20",
      };
      const transaction3 = {
        accountId: account.id,
        payeeName: "Payee Three",
        outflow: "30",
      };

      await addTransaction(cookie, transaction1);
      await addTransaction(cookie, transaction2);
      await addTransaction(cookie, transaction3);

      const user2 = {
        email: "user2@test.com",
        password: "testpasswordABC$",
      };
      await registerUser(user2);
      const cookie2 = await login(user2);
      await createTestAccount(cookie2);

      const { accounts: accounts2 } = await getAccounts(cookie2);
      const accountsArray2 = Object.values(accounts2);
      const account2 = accountsArray2[0];

      const transaction4 = {
        accountId: account2.id,
        payeeName: "User2 Payee",
        outflow: "40",
      };
      await addTransaction(cookie2, transaction4);

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);

      expect(payeesArray.length).toBe(3);
      expect(payeesArray.map((p) => p.name).sort()).toEqual([
        "Payee One",
        "Payee Three",
        "Payee Two",
      ]);
      expect(payeesArray.find((p) => p.name === "User2 Payee")).toBeUndefined();
      payeesArray.forEach((payee) => {
        expect(payee).toHaveProperty("id");
        expect(payee).toHaveProperty("userId");
        expect(payee).toHaveProperty("name");
        expect(payee).toHaveProperty("defaultCategoryId");
        expect(payee).toHaveProperty("includeInPayeeList");
        expect(payee).toHaveProperty("automaticallyCategorisePayee");
        expect(payee).toHaveProperty("createdAt");
        expect(payee).toHaveProperty("updatedAt");
      });
    });
  });

  describe("Delete", () => {
    it("Should delete payee and update transactions with null when no new payeeId provided", async () => {
      const account = await createTestAccount(cookie);
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const createdPayee = Object.values(payees)[0];

      await addTransaction(cookie, {
        accountId: account.id,
        payeeId: createdPayee.id,
        outflow: "20",
      });

      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: "Different Payee",
        outflow: "30",
      });

      const { payees: allPayees } = await getPayees(cookie);
      const differentPayee = Object.values(allPayees).find(
        (p) => p.name === "Different Payee"
      );

      const { transactions: txsBefore } = await getAccounts(cookie);
      const txsBeforeArray = Object.values(txsBefore);
      expect(txsBeforeArray.length).toBe(3);
      expect(txsBeforeArray[0].payeeId).toBe(createdPayee.id);
      expect(txsBeforeArray[1].payeeId).toBe(createdPayee.id);
      expect(txsBeforeArray[2].payeeId).toBe(differentPayee?.id);

      await request(app)
        .delete("/budget/payees")
        .set("Authorization", `Bearer ${cookie}`)
        .send({ payeeId: createdPayee.id })
        .expect(200);

      const { payees: payeesAfter } = await getPayees(cookie);
      expect(payeesAfter[createdPayee.id]).toBeUndefined();
      expect(payeesAfter[differentPayee!.id]).toBeDefined();

      const { transactions: txsAfter } = await getAccounts(cookie);
      const txsAfterArray = Object.values(txsAfter);
      expect(txsAfterArray.length).toBe(3);

      expect(txsAfterArray[0].payeeId).toBeNull();
      expect(txsAfterArray[1].payeeId).toBeNull();
      expect(txsAfterArray[2].payeeId).toBe(differentPayee?.id);
    });

    it("Should delete payee and update transactions with replacement payee when payeeId provided", async () => {
      const account = await createTestAccount(cookie);

      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: "Replacement Payee",
        outflow: "15",
      });

      const { payees } = await getPayees(cookie);
      const payeesToDelete = Object.values(payees).find(
        (p) => p.name === PAYEE_NAME
      );
      const replacementPayee = Object.values(payees).find(
        (p) => p.name === "Replacement Payee"
      );

      await addTransaction(cookie, {
        accountId: account.id,
        payeeId: payeesToDelete!.id,
        outflow: "20",
      });

      const { transactions: txsBefore } = await getAccounts(cookie);
      const txsBeforeArray = Object.values(txsBefore);
      expect(txsBeforeArray.length).toBe(3);

      const txsWithPayeeToDelete = txsBeforeArray.filter(
        (tx) => tx.payeeId === payeesToDelete!.id
      );
      expect(txsWithPayeeToDelete.length).toBe(2);

      await request(app)
        .delete("/budget/payees")
        .set("Authorization", `Bearer ${cookie}`)
        .send({
          payeeId: payeesToDelete!.id,
          replacementPayeeId: replacementPayee!.id,
        })
        .expect(200);

      const { payees: payeesAfter } = await getPayees(cookie);
      expect(payeesAfter[payeesToDelete!.id]).toBeUndefined();
      expect(payeesAfter[replacementPayee!.id]).toBeDefined();

      const { transactions: txsAfter } = await getAccounts(cookie);
      const txsAfterArray = Object.values(txsAfter);
      expect(txsAfterArray.length).toBe(3);
      expect(txsAfterArray[0].payeeId).toBe(replacementPayee!.id);
      expect(txsAfterArray[1].payeeId).toBe(replacementPayee!.id);
      expect(txsAfterArray[2].payeeId).toBe(replacementPayee!.id);
    });

    it("Should return 404 if user doesn't own original payeeId", async () => {
      const account = await createTestAccount(cookie);
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const user1Payee = Object.values(payees)[0];

      const user2 = {
        email: "user2@test.com",
        password: "testpasswordABC$",
      };
      await registerUser(user2);
      const cookie2 = await login(user2);

      await request(app)
        .delete("/budget/payees")
        .set("Authorization", `Bearer ${cookie2}`)
        .send({ payeeId: user1Payee.id })
        .expect(404);

      const { payees: payeesAfter } = await getPayees(cookie);
      expect(payeesAfter[user1Payee.id]).toBeDefined();
    });

    it("Should return 404 if user doesn't own replacement payeeId", async () => {
      const account = await createTestAccount(cookie);
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const user1ReplacementPayee = Object.values(payees).find(
        (p) => p.name === PAYEE_NAME
      );

      const user2 = {
        email: "user2@test.com",
        password: "testpasswordABC$",
      };
      await registerUser(user2);
      const cookie2 = await login(user2);
      await createTestAccount(cookie2);
      const { accounts } = await getAccounts(cookie2);
      const account2 = Object.values(accounts)[0];

      await addTransaction(cookie2, {
        accountId: account2.id,
        payeeName: "User2 Payee",
        outflow: "30",
      });

      const { payees: user2Payees } = await getPayees(cookie2);
      const user2Payee = Object.values(user2Payees)[0];

      await request(app)
        .delete("/budget/payees")
        .set("Authorization", `Bearer ${cookie2}`)
        .send({
          payeeId: user2Payee.id,
          replacementPayeeId: user1ReplacementPayee!.id,
        })
        .expect(404);

      const { payees: user2PayeesAfter } = await getPayees(cookie2);
      expect(user2PayeesAfter[user2Payee.id]).toBeDefined();
    });
  });

  describe("Edit", () => {
    it("Should successfully update payee name", async () => {
      const account = await createTestAccount(cookie);
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const payee = Object.values(payees)[0];

      const NEW_NAME = "Updated Payee Name";
      await editPayee(cookie, {
        payeeId: payee.id,
        newName: NEW_NAME,
      });

      const { payees: updatedPayees } = await getPayees(cookie);
      const updatedPayee = updatedPayees[payee.id];

      expect(updatedPayee).toBeDefined();
      expect(updatedPayee.name).toBe(NEW_NAME);
      expect(updatedPayee.id).toBe(payee.id);
      expect(updatedPayee.defaultCategoryId).toBe(payee.defaultCategoryId);
      expect(updatedPayee.includeInPayeeList).toBe(payee.includeInPayeeList);
      expect(updatedPayee.automaticallyCategorisePayee).toBe(
        payee.automaticallyCategorisePayee
      );
    });

    it("Should update multiple fields at once", async () => {
      const account = await createTestAccount(cookie);
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const payee = Object.values(payees)[0];

      expect(payee.name).toBe(PAYEE_NAME);
      expect(payee.defaultCategoryId).toBeNull();
      expect(payee.includeInPayeeList).toBe(true);
      expect(payee.automaticallyCategorisePayee).toBe(true);

      const NEW_NAME = "Updated Payee Name";
      await editPayee(cookie, {
        payeeId: payee.id,
        newName: NEW_NAME,
        includeInPayeeList: false,
        automaticallyCategorisePayee: false,
      });

      const { payees: updatedPayees } = await getPayees(cookie);
      const updatedPayee = updatedPayees[payee.id];

      expect(updatedPayee).toBeDefined();
      expect(updatedPayee.name).toBe(NEW_NAME);
      expect(updatedPayee.includeInPayeeList).toBe(false);
      expect(updatedPayee.automaticallyCategorisePayee).toBe(false);
      expect(updatedPayee.defaultCategoryId).toBeNull();
      expect(updatedPayee.id).toBe(payee.id);
    });

    it("Should trim whitespace from payee name", async () => {
      const account = await createTestAccount(cookie);
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const payee = Object.values(payees)[0];

      const NEW_NAME = "Updated Name";
      await editPayee(cookie, {
        payeeId: payee.id,
        newName: `   ${NEW_NAME}   `,
      });

      const { payees: updatedPayees } = await getPayees(cookie);
      const updatedPayee = updatedPayees[payee.id];

      expect(updatedPayee).toBeDefined();
      expect(updatedPayee.name).toBe(NEW_NAME);
    });

    it("Should return 400 if payee name is empty or whitespace only", async () => {
      const account = await createTestAccount(cookie);
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const payee = Object.values(payees)[0];

      await editPayee(
        cookie,
        {
          payeeId: payee.id,
          newName: "   ",
        },
        400
      );

      const { payees: unchangedPayees } = await getPayees(cookie);
      const unchangedPayee = unchangedPayees[payee.id];

      expect(unchangedPayee).toBeDefined();
      expect(unchangedPayee.name).toBe(PAYEE_NAME);
    });

    it("Should return 400 if payee name exceeds maximum length", async () => {
      const account = await createTestAccount(cookie);
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const payee = Object.values(payees)[0];

      const longName = "A".repeat(51);

      await editPayee(
        cookie,
        {
          payeeId: payee.id,
          newName: longName,
        },
        400
      );

      const { payees: unchangedPayees } = await getPayees(cookie);
      const unchangedPayee = unchangedPayees[payee.id];

      expect(unchangedPayee).toBeDefined();
      expect(unchangedPayee.name).toBe(PAYEE_NAME);
    });

    it("Should return 409 if renaming to existing payee name", async () => {
      expect.hasAssertions();

      const account = await createTestAccount(cookie);

      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: "Existing Payee",
        outflow: "10",
      });

      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);
      const payeeToRename = payeesArray.find((p) => p.name === PAYEE_NAME);

      expect(payeeToRename).toBeDefined();

      await editPayee(
        cookie,
        {
          payeeId: payeeToRename!.id,
          newName: "Existing Payee",
        },
        409
      );

      const { payees: unchangedPayees } = await getPayees(cookie);
      const unchangedPayee = unchangedPayees[payeeToRename!.id];

      expect(unchangedPayee).toBeDefined();
      expect(unchangedPayee.name).toBe(PAYEE_NAME);
    });

    it("Should return 404 if user doesn't own payeeId", async () => {
      expect.hasAssertions();

      const user2 = {
        email: "user2@test.com",
        password: "testpasswordABC$",
      };
      await registerUser(user2);
      const cookie2 = await login(user2);
      await createTestAccount(cookie2);

      const { accounts: accounts2 } = await getAccounts(cookie2);
      const accountsArray2 = Object.values(accounts2);
      const account2 = accountsArray2[0];

      await addTransaction(cookie2, {
        accountId: account2.id,
        payeeName: "User2 Payee",
        outflow: "10",
      });

      const { payees: payees2 } = await getPayees(cookie2);
      const payeesArray2 = Object.values(payees2);
      const user2Payee = payeesArray2[0];

      await editPayee(
        cookie,
        {
          payeeId: user2Payee.id,
          newName: "Hacked Name",
        },
        404
      );

      const { payees: unchangedPayees } = await getPayees(cookie2);
      const unchangedPayee = unchangedPayees[user2Payee.id];

      expect(unchangedPayee).toBeDefined();
      expect(unchangedPayee.name).toBe("User2 Payee");
    });

    it("Should return 404 if user doesn't own categoryId", async () => {
      const account = await createTestAccount(cookie);

      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const payee = Object.values(payees)[0];

      const user2 = {
        email: "user2@test.com",
        password: "testpasswordABC$",
      };
      await registerUser(user2);
      const cookie2 = await login(user2);
      await createTestAccount(cookie2);

      const { categories: categories2 } = await getCategories(cookie2);
      const user2Category = Object.values(categories2).find(
        (cat) => cat.name === "test category"
      );

      await editPayee(
        cookie,
        {
          payeeId: payee.id,
          newDefaultCategoryId: user2Category!.id,
        },
        404
      );

      const { payees: unchangedPayees } = await getPayees(cookie);
      const unchangedPayee = unchangedPayees[payee.id];

      expect(unchangedPayee).toBeDefined();
      expect(unchangedPayee.defaultCategoryId).toBeNull();
    });

    it("Should handle concurrent payee renames to same name (race condition)", async () => {
      const account = await createTestAccount(cookie);

      // Create two different payees
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: "Payee A",
        outflow: "10",
      });

      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: "Payee B",
        outflow: "20",
      });

      const { payees } = await getPayees(cookie);
      const payeeA = Object.values(payees).find((p) => p.name === "Payee A");
      const payeeB = Object.values(payees).find((p) => p.name === "Payee B");

      const TARGET_NAME = "Target Name";

      // Try to rename both to the same name concurrently
      const promises = [
        editPayee(cookie, { payeeId: payeeA!.id, newName: TARGET_NAME }),
        editPayee(cookie, { payeeId: payeeB!.id, newName: TARGET_NAME }),
      ];

      const results = await Promise.allSettled(promises);

      // One should succeed, one should fail
      const succeeded = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      expect(succeeded.length + failed.length).toBe(2);
      expect(succeeded.length).toBeGreaterThanOrEqual(1);

      // Verify only one payee has the target name
      const { payees: finalPayees } = await getPayees(cookie);
      const payeesArray = Object.values(finalPayees);
      const targetNamePayees = payeesArray.filter(
        (p) => p.name === TARGET_NAME
      );
      expect(targetNamePayees).toHaveLength(1);
    });

    it("Should return 400 if no update fields are provided", async () => {
      const account = await createTestAccount(cookie);
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const payee = Object.values(payees)[0];

      await editPayee(
        cookie,
        {
          payeeId: payee.id,
        },
        400
      );

      const { payees: unchangedPayees } = await getPayees(cookie);
      const unchangedPayee = unchangedPayees[payee.id];

      expect(unchangedPayee).toBeDefined();
      expect(unchangedPayee.name).toBe(PAYEE_NAME);
    });
  });

  describe("Bulk Operations", () => {
    describe("Edit Payees In Bulk", () => {
      it("Should update includeInPayeeList for multiple payees", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 1",
          outflow: "10",
        });
        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 2",
          outflow: "20",
        });
        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 3",
          outflow: "30",
        });

        const { payees } = await getPayees(cookie);
        const payeesArray = Object.values(payees);
        const payeeIds = payeesArray.map((p) => p.id);

        // All should start as included
        payeesArray.forEach((p) => {
          expect(p.includeInPayeeList).toBe(true);
        });

        const payload: EditPayeesPayloadWithoutUserId = {
          payeeIds,
          updates: { includeInPayeeList: false },
        };

        await editPayees(cookie, payload, 200);

        const { payees: updatedPayees } = await getPayees(cookie);
        const updatedPayeesArray = Object.values(updatedPayees);

        updatedPayeesArray.forEach((p) => {
          expect(p.includeInPayeeList).toBe(false);
        });
      });

      it("Should return 404 if user doesn't own one of the payees", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "User1 Payee",
          outflow: "10",
        });

        const { payees: user1Payees } = await getPayees(cookie);
        const user1PayeeId = Object.values(user1Payees)[0].id;

        const user2 = {
          email: "user2@test.com",
          password: "testpasswordABC$",
        };
        await registerUser(user2);
        const cookie2 = await login(user2);

        const payload: EditPayeesPayloadWithoutUserId = {
          payeeIds: [user1PayeeId],
          updates: { includeInPayeeList: false },
        };

        await editPayees(cookie2, payload, 404);
      });

      it("Should return 400 if no update fields provided", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 1",
          outflow: "10",
        });

        const { payees } = await getPayees(cookie);
        const payeeId = Object.values(payees)[0].id;

        await request(app)
          .patch("/budget/payees/bulk")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            payeeIds: [payeeId],
            updates: {},
          })
          .expect(400);
      });
    });

    describe("Combine Payees", () => {
      it("Should combine multiple payees into target payee", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 1",
          outflow: "10",
        });
        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 2",
          outflow: "20",
        });
        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 3",
          outflow: "30",
        });

        const { payees } = await getPayees(cookie);
        const payeesArray = Object.values(payees);
        const payee1 = payeesArray.find((p) => p.name === "Payee 1")!;
        const payee2 = payeesArray.find((p) => p.name === "Payee 2")!;
        const payee3 = payeesArray.find((p) => p.name === "Payee 3")!;

        await addTransaction(cookie, {
          accountId: account.id,
          payeeId: payee2.id,
          outflow: "40",
        });
        await addTransaction(cookie, {
          accountId: account.id,
          payeeId: payee3.id,
          outflow: "50",
        });

        const { transactions: txsBefore } = await getAccounts(cookie);
        const txsBeforeArray = Object.values(txsBefore);
        expect(txsBeforeArray.length).toBe(5);

        const payload: CombinePayeesPayloadWithoutUserId = {
          payeeIds: [payee1.id, payee2.id],
          targetPayeeId: payee3.id,
        };

        await combinePayees(cookie, payload, 200);

        const { payees: payeesAfter } = await getPayees(cookie);
        expect(payeesAfter[payee1.id]).toBeUndefined();
        expect(payeesAfter[payee2.id]).toBeUndefined();
        expect(payeesAfter[payee3.id]).toBeDefined();

        const { transactions: txsAfter } = await getAccounts(cookie);
        const txsAfterArray = Object.values(txsAfter);
        expect(txsAfterArray.length).toBe(5);
        txsAfterArray.forEach((tx) => {
          expect(tx.payeeId).toBe(payee3.id);
        });
      });

      it("Should return 400 if target payee is in payeeIds list", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 1",
          outflow: "10",
        });
        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 2",
          outflow: "20",
        });

        const { payees } = await getPayees(cookie);
        const payeesArray = Object.values(payees);
        const payee1 = payeesArray.find((p) => p.name === "Payee 1")!;
        const payee2 = payeesArray.find((p) => p.name === "Payee 2")!;

        const payload: CombinePayeesPayloadWithoutUserId = {
          payeeIds: [payee1.id, payee2.id],
          targetPayeeId: payee1.id,
        };

        await combinePayees(cookie, payload, 400);
      });

      it("Should return 404 if user doesn't own one of the payees", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "User1 Payee",
          outflow: "10",
        });

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "User1 Payee2",
          outflow: "10",
        });

        const { payees: user1Payees } = await getPayees(cookie);
        const user1PayeeId = Object.values(user1Payees)[0].id;
        const user1PayeeId2 = Object.values(user1Payees)[1].id;

        const user2 = {
          email: "user2@test.com",
          password: "testpasswordABC$",
        };
        await registerUser(user2);
        const cookie2 = await login(user2);
        await createTestAccount(cookie2);

        const { accounts: accounts2 } = await getAccounts(cookie2);
        const account2 = Object.values(accounts2)[0];

        await addTransaction(cookie2, {
          accountId: account2.id,
          payeeName: "User2 Payee",
          outflow: "20",
        });

        const { payees: user2Payees } = await getPayees(cookie2);
        const user2PayeeId = Object.values(user2Payees)[0].id;

        const payload: CombinePayeesPayloadWithoutUserId = {
          payeeIds: [user1PayeeId, user1PayeeId2],
          targetPayeeId: user2PayeeId,
        };

        await combinePayees(cookie2, payload, 404);
      });

      it("Should require at least 2 payees to combine", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 1",
          outflow: "10",
        });

        const { payees } = await getPayees(cookie);
        const payeeId = Object.values(payees)[0].id;

        await request(app)
          .post("/budget/payees/combine")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            payeeIds: [payeeId],
            targetPayeeId: payeeId,
          })
          .expect(400);
      });
    });

    describe("Delete Payees In Bulk", () => {
      it("Should delete multiple payees and set transactions to null", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 1",
          outflow: "10",
        });

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 2",
          outflow: "20",
        });

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Keep Payee",
          outflow: "30",
        });

        const { payees } = await getPayees(cookie);
        const payeesArray = Object.values(payees);
        const payee1 = payeesArray.find((p) => p.name === "Payee 1")!;
        const payee2 = payeesArray.find((p) => p.name === "Payee 2")!;
        const keepPayee = payeesArray.find((p) => p.name === "Keep Payee")!;

        const payload: DeletePayeesPayloadWithoutUserId = {
          payeeIds: [payee1.id, payee2.id],
        };

        await deletePayees(cookie, payload);

        const { payees: payeesAfter } = await getPayees(cookie);
        expect(payeesAfter[payee1.id]).toBeUndefined();
        expect(payeesAfter[payee2.id]).toBeUndefined();
        expect(payeesAfter[keepPayee.id]).toBeDefined();

        const { transactions: txsAfter } = await getAccounts(cookie);
        const txsAfterArray = Object.values(txsAfter);
        expect(txsAfterArray[0].payeeId).toBeNull();
        expect(txsAfterArray[1].payeeId).toBeNull();
        expect(txsAfterArray[2].payeeId).toBe(keepPayee.id);
      });

      it("Should delete multiple payees and reassign to replacement payee", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 1",
          outflow: "10",
        });
        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 2",
          outflow: "20",
        });
        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Replacement",
          outflow: "30",
        });

        const { payees } = await getPayees(cookie);
        const payeesArray = Object.values(payees);
        const payee1 = payeesArray.find((p) => p.name === "Payee 1")!;
        const payee2 = payeesArray.find((p) => p.name === "Payee 2")!;
        const replacement = payeesArray.find((p) => p.name === "Replacement")!;

        const payload: DeletePayeesPayloadWithoutUserId = {
          payeeIds: [payee1.id, payee2.id],
          replacementPayeeId: replacement.id,
        };

        await deletePayees(cookie, payload);

        const { payees: payeesAfter } = await getPayees(cookie);
        expect(payeesAfter[payee1.id]).toBeUndefined();
        expect(payeesAfter[payee2.id]).toBeUndefined();
        expect(payeesAfter[replacement.id]).toBeDefined();

        const { transactions: txsAfter } = await getAccounts(cookie);
        const txsAfterArray = Object.values(txsAfter);
        txsAfterArray.forEach((tx) => {
          expect(tx.payeeId).toBe(replacement.id);
        });
      });

      it("Should return 400 if replacement payee is in delete list", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 1",
          outflow: "10",
        });

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "Payee 2",
          outflow: "20",
        });

        const { payees } = await getPayees(cookie);
        const payeesArray = Object.values(payees);
        const payee1 = payeesArray.find((p) => p.name === "Payee 1")!;
        const payee2 = payeesArray.find((p) => p.name === "Payee 2")!;

        const payload: DeletePayeesPayloadWithoutUserId = {
          payeeIds: [payee1.id, payee2.id],
          replacementPayeeId: payee1.id,
        };

        await deletePayees(cookie, payload, 400);
      });

      it("Should return 404 if user doesn't own one of the payees to delete", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "User1 Payee",
          outflow: "10",
        });

        const { payees: user1Payees } = await getPayees(cookie);
        const user1PayeeId = Object.values(user1Payees)[0].id;

        const user2 = {
          email: "user2@test.com",
          password: "testpasswordABC$",
        };
        await registerUser(user2);
        const cookie2 = await login(user2);

        const payload: DeletePayeesPayloadWithoutUserId = {
          payeeIds: [user1PayeeId],
        };

        await deletePayees(cookie2, payload, 404);
      });

      it("Should return 404 if user doesn't own replacement payee", async () => {
        const account = await createTestAccount(cookie);

        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: "User1 Payee",
          outflow: "10",
        });

        const { payees: user1Payees } = await getPayees(cookie);
        const user1PayeeId = Object.values(user1Payees)[0].id;

        const user2 = {
          email: "user2@test.com",
          password: "testpasswordABC$",
        };
        await registerUser(user2);
        const cookie2 = await login(user2);
        await createTestAccount(cookie2);

        const { accounts: accounts2 } = await getAccounts(cookie2);
        const account2 = Object.values(accounts2)[0];

        await addTransaction(cookie2, {
          accountId: account2.id,
          payeeName: "User2 Payee",
          outflow: "20",
        });

        const { payees: user2Payees } = await getPayees(cookie2);
        const user2PayeeId = Object.values(user2Payees)[0].id;

        const payload: DeletePayeesPayloadWithoutUserId = {
          payeeIds: [user2PayeeId],
          replacementPayeeId: user1PayeeId,
        };

        await deletePayees(cookie2, payload, 404);
      });
    });
  });
});
