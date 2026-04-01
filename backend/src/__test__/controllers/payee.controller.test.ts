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
import request from "supertest";
import app from "../../app";
import { createAccountAndFetch } from "../utils/account";
import { SYSTEM_PAYEE_NAMES } from "../../features/budget/payee/payee.constants";

const PAYEE_NAME = "testPayee";

describe("Payee", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Create", () => {
    it("Should create payee when adding transaction with payeeName", async () => {
      const account = await createAccountAndFetch(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };

      await addTransaction(cookie, transaction);
      const { payees: afterPayees } = await getPayees(cookie);
      const payeesArray = Object.values(afterPayees);

      const created = payeesArray.find((p) => p.name === PAYEE_NAME);
      expect(created).toBeDefined();
    });

    it("Should create payee with default settings when adding transaction with new payeeName", async () => {
      const account = await createAccountAndFetch(cookie);

      const transactionInput = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };

      await addTransaction(cookie, transactionInput);

      const { payees } = await getPayees(cookie);
      const { transactions } = await getAccounts(cookie);

      const payeesArray = Object.values(payees);
      const transactionsArray = Object.values(transactions);

      const testPayee = payeesArray.find((p) => p.name === PAYEE_NAME);
      expect(testPayee).toBeDefined();

      const testTransaction = transactionsArray.find(
        (tx) => tx.payeeId === testPayee!.id
      );
      expect(testTransaction).toBeDefined();

      expect(testPayee!.defaultCategoryId).toBeNull();
      expect(testPayee!.includeInPayeeList).toBe(true);
      expect(testPayee!.automaticallyCategorisePayee).toBe(true);
    });

    it("Should trim whitespace from payeeName when creating a payee", async () => {
      const account = await createAccountAndFetch(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: "   " + PAYEE_NAME + "   ",
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);

      const testPayee = payeesArray.find((p) => p.name === PAYEE_NAME);

      expect(testPayee).toBeDefined();
      expect(testPayee!.name).toBe(PAYEE_NAME);
    });

    it("Should return 409 if user sends payeeName that already exists", async () => {
      const account = await createAccountAndFetch(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      await addTransaction(cookie, transaction, 409);
    });

    it("Should return 400 if user sends payeeName and payeeId", async () => {
      const account = await createAccountAndFetch(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        payeeId: "123e4567-e89b-12d3-a456-426614174000",
        outflow: "10",
      };

      await addTransaction(cookie, transaction, 400);
    });
    it("Should return 400 if user sends payeeName as empty string", async () => {
      const account = await createAccountAndFetch(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: "   ",
        outflow: "10",
      };

      await addTransaction(cookie, transaction, 400);
    });
    it("Should return 400 if payeeName exceeds maximum length", async () => {
      const account = await createAccountAndFetch(cookie);

      const longPayeeName = "A".repeat(51);

      const transaction = {
        accountId: account.id,
        payeeName: longPayeeName,
        outflow: "10",
      };

      await addTransaction(cookie, transaction, 400);
    });

    it("Should create payee with minimum name length of 1 character", async () => {
      const account = await createAccountAndFetch(cookie);

      const transaction = {
        accountId: account.id,
        payeeName: "A",
        outflow: "10",
      };

      await addTransaction(cookie, transaction);

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);

      const testPayee = payeesArray.find((p) => p.name === "A");

      expect(testPayee).toBeDefined();
      expect(testPayee!.name).toBe("A");
    });

    it("Should handle concurrent duplicate payee creates (race condition)", async () => {
      const account = await createAccountAndFetch(cookie);

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
      const account = await createAccountAndFetch(cookie);

      const transactionInput = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };

      await addTransaction(cookie, transactionInput);

      const { payees } = await getPayees(cookie);
      const { transactions } = await getAccounts(cookie);

      const payeesArray = Object.values(payees);
      const transactionsArray = Object.values(transactions);

      const testPayee = payeesArray.find((p) => p.name === PAYEE_NAME);
      expect(testPayee).toBeDefined();

      const testTransaction = transactionsArray.find(
        (tx) => tx.payeeId === testPayee!.id
      );
      expect(testTransaction).toBeDefined();
      expect(testTransaction!.payeeId).toBe(testPayee!.id);
    });

    it("Should link transaction to existing payee when payeeId is provided", async () => {
      const account = await createAccountAndFetch(cookie);

      const transaction1 = {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      };
      await addTransaction(cookie, transaction1);

      const { payees } = await getPayees(cookie);
      const testPayee = Object.values(payees).find(
        (p) => p.name === PAYEE_NAME
      );
      expect(testPayee).toBeDefined();

      const transaction2 = {
        accountId: account.id,
        payeeId: testPayee!.id,
        outflow: "20",
      };
      await addTransaction(cookie, transaction2);

      const { transactions } = await getAccounts(cookie);
      const transactionsArray = Object.values(transactions).filter(
        (tx) => tx.payeeId === testPayee!.id
      );

      expect(transactionsArray.length).toBe(2);
      transactionsArray.forEach((tx) => {
        expect(tx.payeeId).toBe(testPayee!.id);
      });
    });

    it("Should return 404 if user doesn't own payeeId - adding tx", async () => {
      await createAccountAndFetch(cookie);

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
      await createAccountAndFetch(cookie2);

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
      const account = await createAccountAndFetch(cookie);

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

      // Create another user and their payee
      const user2 = { email: "user2@test.com", password: "testpasswordABC$" };
      await registerUser(user2);
      const cookie2 = await login(user2);
      const account2 = (await createAccountAndFetch(cookie2)).id;
      const transaction4 = {
        accountId: account2,
        payeeName: "User2 Payee",
        outflow: "40",
      };
      await addTransaction(cookie2, transaction4);

      const { payees } = await getPayees(cookie);
      const payeesArray = Object.values(payees);

      // Only include payees actually created by this user (exclude system payees)
      const userPayees = payeesArray.filter((p) => p.origin === "USER");

      const userPayeeNames = userPayees.map((p) => p.name).sort();

      expect(userPayeeNames).toEqual(["Payee One", "Payee Three", "Payee Two"]);
      expect(userPayees.find((p) => p.name === "User2 Payee")).toBeUndefined();

      userPayees.forEach((payee) => {
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
      const account = await createAccountAndFetch(cookie);

      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: PAYEE_NAME,
        outflow: "10",
      });

      const { payees } = await getPayees(cookie);
      const createdPayee = Object.values(payees).find(
        (p) => p.name === PAYEE_NAME
      );
      expect(createdPayee).toBeDefined();

      await addTransaction(cookie, {
        accountId: account.id,
        payeeId: createdPayee!.id,
        outflow: "20",
      });

      const differentPayeeName = "Different Payee";
      await addTransaction(cookie, {
        accountId: account.id,
        payeeName: differentPayeeName,
        outflow: "30",
      });

      const { payees: allPayees } = await getPayees(cookie);
      const differentPayee = Object.values(allPayees).find(
        (p) => p.name === differentPayeeName
      );
      expect(differentPayee).toBeDefined();

      const { transactions: txsBefore } = await getAccounts(cookie);
      const txsBeforeArray = Object.values(txsBefore);

      expect(
        txsBeforeArray.filter((tx) => tx.payeeId === createdPayee!.id).length
      ).toBe(2);
      expect(
        txsBeforeArray.find((tx) => tx.payeeId === differentPayee!.id)
      ).toBeDefined();

      await request(app)
        .delete("/budget/payees")
        .set("Authorization", `Bearer ${cookie}`)
        .send({ payeeId: createdPayee!.id })
        .expect(200);

      const { payees: payeesAfter } = await getPayees(cookie);
      expect(payeesAfter[createdPayee!.id]).toBeUndefined();
      expect(payeesAfter[differentPayee!.id]).toBeDefined();

      const { transactions: txsAfter } = await getAccounts(cookie);
      const txsAfterArray = Object.values(txsAfter);

      txsAfterArray
        .filter(
          (tx) => tx.id !== undefined && tx.payeeId !== differentPayee!.id
        )
        .forEach((tx) => {
          expect(tx.payeeId).toBeNull();
        });

      expect(
        txsAfterArray.find((tx) => tx.payeeId === differentPayee!.id)
      ).toBeDefined();
    });

    it("Should delete payee and update transactions with replacement payee when payeeId provided", async () => {
      const account = await createAccountAndFetch(cookie);

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
      const account = await createAccountAndFetch(cookie);
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
      const account = await createAccountAndFetch(cookie);
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
      await createAccountAndFetch(cookie2);
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
    it("Should return 400 if deleting system payees", async () => {
      // Fetch the system payee
      const SYSTEM_PAYEE_NAME = SYSTEM_PAYEE_NAMES[0];
      const { payees } = await getPayees(cookie);
      const systemPayee = Object.values(payees).find(
        (p) => p.name === SYSTEM_PAYEE_NAME
      );

      expect(systemPayee).toBeDefined();
      expect(systemPayee!.origin).toBe("SYSTEM");

      // Attempt to delete the system payee - backend should reject
      await request(app)
        .delete("/budget/payees")
        .set("Authorization", `Bearer ${cookie}`)
        .send({ payeeId: systemPayee!.id })
        .expect(400);

      // Verify the payee still exists
      const { payees: payeesAfter } = await getPayees(cookie);
      const existingPayee = payeesAfter[systemPayee!.id];

      expect(existingPayee).toBeDefined();
      expect(existingPayee!.name).toBe(SYSTEM_PAYEE_NAME);
      expect(existingPayee!.origin).toBe("SYSTEM");
    });
  });

  describe("Edit", () => {
    describe("Error Cases", () => {
      it("Should return 400 if no update fields are provided", async () => {
        // Setup: create account and add a transaction with a payee
        const account = await createAccountAndFetch(cookie);
        await addTransaction(cookie, {
          accountId: account.id,
          payeeName: PAYEE_NAME,
          outflow: "10",
        });

        // Fetch the payee created from the transaction
        const { payees } = await getPayees(cookie);
        const payee = Object.values(payees).find((p) => p.name === PAYEE_NAME);
        expect(payee).toBeDefined();

        // Attempt to edit the payee without providing any update fields, expect 400
        await editPayee(
          cookie,
          {
            payeeId: payee!.id,
          },
          400
        );

        // Fetch payees again and verify that nothing has changed
        const { payees: unchangedPayees } = await getPayees(cookie);
        const unchangedPayee = unchangedPayees[payee!.id];

        expect(unchangedPayee).toBeDefined();
        expect(unchangedPayee!.name).toBe(PAYEE_NAME);
      });
      it("Should return 400 if editing a system payee", async () => {
        // Fetch a system payee
        const SYSTEM_PAYEE_NAME = SYSTEM_PAYEE_NAMES[0];
        const { payees } = await getPayees(cookie);
        const systemPayee = Object.values(payees).find(
          (p) => p.name === SYSTEM_PAYEE_NAME
        );

        expect(systemPayee).toBeDefined();
        expect(systemPayee!.origin).toBe("SYSTEM");

        // Attempt to edit the system payee - backend should reject
        await editPayee(
          cookie,
          {
            payeeId: systemPayee!.id,
            newName: "Attempted Rename",
          },
          400
        );

        // Verify that the system payee has not been modified
        const { payees: payeesAfter } = await getPayees(cookie);
        const unchangedPayee = payeesAfter[systemPayee!.id];

        expect(unchangedPayee).toBeDefined();
        expect(unchangedPayee!.name).toBe(SYSTEM_PAYEE_NAME);
        expect(unchangedPayee!.origin).toBe("SYSTEM");
      });
    });
  });

  describe("Bulk Operations", () => {
    describe("Edit Payees In Bulk", () => {
      it("Should update includeInPayeeList for multiple payees", async () => {
        const account = await createAccountAndFetch(cookie);

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

        // Only include user-created payees, skip system ones
        const userPayees = payeesArray.filter((p) => p.origin !== "SYSTEM");
        const payeeIds = userPayees.map((p) => p.id);

        // All should start as included
        userPayees.forEach((p) => {
          expect(p.includeInPayeeList).toBe(true);
        });

        const payload: EditPayeesPayloadWithoutUserId = {
          payeeIds,
          updates: { includeInPayeeList: false },
        };

        await editPayees(cookie, payload, 200);

        const { payees: updatedPayees } = await getPayees(cookie);
        const updatedPayeesArray = Object.values(updatedPayees);
        // Only include user-created payees, skip system ones
        const updatedUserPayeesArray = updatedPayeesArray.filter(
          (p) => p.origin !== "SYSTEM"
        );

        updatedUserPayeesArray.forEach((p) => {
          expect(p.includeInPayeeList).toBe(false);
        });
      });

      it("Should return 404 if user doesn't own one of the payees", async () => {
        const account = await createAccountAndFetch(cookie);

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
        const account = await createAccountAndFetch(cookie);

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
      it("Should return 400 if bulk editing of system payees", async () => {
        // Fetch a system payee
        const SYSTEM_PAYEE_NAME = SYSTEM_PAYEE_NAMES[0];
        const { payees } = await getPayees(cookie);
        const systemPayee = Object.values(payees).find(
          (p) => p.name === SYSTEM_PAYEE_NAME
        );

        expect(systemPayee).toBeDefined();
        expect(systemPayee!.origin).toBe("SYSTEM");

        // Attempt to bulk edit the system payee - backend should reject
        await request(app)
          .patch("/budget/payees/bulk")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            payeeIds: [systemPayee!.id],
            updates: { includeInPayeeList: false },
          })
          .expect(400);

        // Verify that the system payee has not been modified
        const { payees: payeesAfter } = await getPayees(cookie);
        const unchangedPayee = payeesAfter[systemPayee!.id];

        expect(unchangedPayee).toBeDefined();
        expect(unchangedPayee!.name).toBe(SYSTEM_PAYEE_NAME);
        expect(unchangedPayee!.origin).toBe("SYSTEM");
      });
    });

    describe("Combine Payees", () => {
      it("Should combine multiple payees into target payee", async () => {
        const account = await createAccountAndFetch(cookie);

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
        const account = await createAccountAndFetch(cookie);

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

      it("Should return 400 if target payee is a system payee", async () => {
        const account = await createAccountAndFetch(cookie);

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

        const SYSTEM_PAYEE_NAME = SYSTEM_PAYEE_NAMES[0];

        const { payees } = await getPayees(cookie);

        const systemPayee = Object.values(payees).find(
          (p) => p.name === SYSTEM_PAYEE_NAME
        );
        expect(systemPayee).toBeDefined();
        expect(systemPayee!.origin).toBe("SYSTEM");

        const payeesArray = Object.values(payees);
        const payee1 = payeesArray.find((p) => p.name === "Payee 1")!;
        const payee2 = payeesArray.find((p) => p.name === "Payee 2")!;

        const payload: CombinePayeesPayloadWithoutUserId = {
          payeeIds: [payee1.id, payee2.id],
          targetPayeeId: systemPayee!.id,
        };

        await combinePayees(cookie, payload, 400);
      });
      it("Should return 400 if combining a system payee", async () => {
        const account = await createAccountAndFetch(cookie);

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

        const SYSTEM_PAYEE_NAME = SYSTEM_PAYEE_NAMES[0];

        const { payees } = await getPayees(cookie);

        const systemPayee = Object.values(payees).find(
          (p) => p.name === SYSTEM_PAYEE_NAME
        );
        expect(systemPayee).toBeDefined();
        expect(systemPayee!.origin).toBe("SYSTEM");

        const payeesArray = Object.values(payees);
        const payee1 = payeesArray.find((p) => p.name === "Payee 1")!;
        const payee2 = payeesArray.find((p) => p.name === "Payee 2")!;

        const payload: CombinePayeesPayloadWithoutUserId = {
          payeeIds: [payee1.id, systemPayee!.id],
          targetPayeeId: payee2.id,
        };

        await combinePayees(cookie, payload, 400);
      });
      it("Should return 404 if user doesn't own one of the payees", async () => {
        const account = await createAccountAndFetch(cookie);

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
        await createAccountAndFetch(cookie2);

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
        const account = await createAccountAndFetch(cookie);

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
        const account = await createAccountAndFetch(cookie);

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
        const account = await createAccountAndFetch(cookie);

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
        const account = await createAccountAndFetch(cookie);

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
      it("Should return 400 if deleting a system payee", async () => {
        const account = await createAccountAndFetch(cookie);

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

        const SYSTEM_PAYEE_NAME = SYSTEM_PAYEE_NAMES[0];

        const { payees } = await getPayees(cookie);

        const systemPayee = Object.values(payees).find(
          (p) => p.name === SYSTEM_PAYEE_NAME
        );
        expect(systemPayee).toBeDefined();
        expect(systemPayee!.origin).toBe("SYSTEM");

        const payeesArray = Object.values(payees);
        const payee1 = payeesArray.find((p) => p.name === "Payee 1")!;

        const payload: DeletePayeesPayloadWithoutUserId = {
          payeeIds: [systemPayee!.id],
          replacementPayeeId: payee1.id,
        };

        await deletePayees(cookie, payload, 400);
      });
      it("Should return 400 if a system payee is the replacement", async () => {
        const account = await createAccountAndFetch(cookie);

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

        const SYSTEM_PAYEE_NAME = SYSTEM_PAYEE_NAMES[0];

        const { payees } = await getPayees(cookie);

        const systemPayee = Object.values(payees).find(
          (p) => p.name === SYSTEM_PAYEE_NAME
        );
        expect(systemPayee).toBeDefined();
        expect(systemPayee!.origin).toBe("SYSTEM");

        const payeesArray = Object.values(payees);
        const payee1 = payeesArray.find((p) => p.name === "Payee 1")!;

        const payload: DeletePayeesPayloadWithoutUserId = {
          payeeIds: [payee1.id],
          replacementPayeeId: systemPayee!.id,
        };

        await deletePayees(cookie, payload, 400);
      });
      it("Should return 404 if user doesn't own one of the payees to delete", async () => {
        const account = await createAccountAndFetch(cookie);

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
        const account = await createAccountAndFetch(cookie);

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
        await createAccountAndFetch(cookie2);

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
