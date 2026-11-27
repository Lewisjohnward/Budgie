import { v4 as uuidv4 } from "uuid";
import { login, registerUser } from "../../utils/auth";
import { getAccounts } from "../../utils/getData";
import {
  createAccountAndReturn,
  deleteAccount,
  fetchAccountByName,
  createAccount,
} from "../../utils/account";
import {
  addTransactionLegacy,
  getTransactionsForAccountId,
  TestInsertTransactionInputWithoutUserId,
} from "../../utils/transaction";
import { getMonthsForRtaCategory } from "../../utils/appSnapshot";

describe("Account - Delete", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
  describe("Error Cases", () => {
    it("Should return 404 if account not owned by user", async () => {
      await registerUser({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });

      const cookie2 = await login({
        email: "testa@test.com",
        password: "testpasswordABC$",
      });
      const unownedAccount = await createAccount(cookie2, {
        name: "unowned",
      });

      const unowned = await fetchAccountByName(cookie2, unownedAccount.name);
      const resDeleteAccount = await deleteAccount(cookie, unowned.id);
      expect(resDeleteAccount.status).toBe(404);
    });
    it("Should return 404 if account doesn't exist", async () => {
      const id = uuidv4();
      const resDeleteAccount = await deleteAccount(cookie, id);
      expect(resDeleteAccount.status).toBe(404);
    });
    it("Should return 409 when deleting an undeletable account", async () => {
      const account = await createAccount(cookie);

      const accountBefore = await fetchAccountByName(cookie, account.name);
      const { id } = accountBefore;
      const transaction: TestInsertTransactionInputWithoutUserId = {
        accountId: id,
        outflow: "10",
      };

      await addTransactionLegacy(cookie, transaction);
      const transactionsBefore = await getTransactionsForAccountId(cookie, id);

      const accountAfterTransaction = await fetchAccountByName(
        cookie,
        account.name
      );

      const resDeleteAccount = await deleteAccount(cookie, id);
      expect(resDeleteAccount.status).toBe(409);
      const transactionsAfter = await getTransactionsForAccountId(cookie, id);
      const accountAfter = await fetchAccountByName(cookie, account.name);

      expect(accountAfter).toEqual(accountAfterTransaction);
      expect(transactionsBefore).toEqual(transactionsAfter);
    });
  });
  describe("Success", () => {
    it("Should delete account when it has no user transactions (is deletable)", async () => {
      const account = await createAccount(cookie);

      const accountBefore = await fetchAccountByName(cookie, account.name);
      expect(accountBefore.open).toBe(true);
      expect(accountBefore.deletable).toBe(true);

      const { id } = accountBefore;
      const resDeleteAccount = await deleteAccount(cookie, id);
      expect(resDeleteAccount.status).toBe(200);

      await expect(fetchAccountByName(cookie, account.name)).rejects.toThrow();

      const { accounts } = await getAccounts(cookie);
      expect(Object.values(accounts).some((a) => a.id === id)).toBe(false);

      const transactions = await getTransactionsForAccountId(cookie, id);
      expect(transactions).toHaveLength(0);
    });
  });
  describe("Side effects", () => {
    describe("Repositioning", () => {
      it("Should reposition accounts on deletion", async () => {
        const accountsBefore = await Promise.all(
          [1, 2, 3].map((n) =>
            createAccountAndReturn(cookie, {
              type: "BANK",
              balance: 0,
              name: `account ${n}`,
            })
          )
        );

        expect(accountsBefore.map((account) => account.position)).toEqual([
          0, 1, 2,
        ]);

        const deletedAccount = accountsBefore[1];
        const res = await deleteAccount(cookie, deletedAccount.id);

        expect(res.status).toBe(200);

        const accountsAfter = await Promise.all(
          ["account 1", "account 3"].map((name) =>
            fetchAccountByName(cookie, name)
          )
        );

        expect(accountsAfter.map((account) => account.position)).toEqual([
          0, 1,
        ]);
      });

      it("Should reposition bank accounts without affecting credit card positions", async () => {
        const bank1 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "BANK",
          name: "bank 1",
        });
        const bank2 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "BANK",
          name: "bank 2",
        });
        const bank3 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "BANK",
          name: "bank 3",
        });

        const card1 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "CREDIT_CARD",
          name: "card 1",
        });
        const card2 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "CREDIT_CARD",
          name: "card 2",
        });
        const card3 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "CREDIT_CARD",
          name: "card 3",
        });

        expect([bank1.position, bank2.position, bank3.position]).toEqual([
          0, 1, 2,
        ]);
        expect([card1.position, card2.position, card3.position]).toEqual([
          0, 1, 2,
        ]);

        const res = await deleteAccount(cookie, bank2.id);
        expect(res.status).toBe(200);

        const bank1After = await fetchAccountByName(cookie, "bank 1");
        const bank3After = await fetchAccountByName(cookie, "bank 3");

        expect([bank1After.position, bank3After.position]).toEqual([0, 1]);

        const card1After = await fetchAccountByName(cookie, "card 1");
        const card2After = await fetchAccountByName(cookie, "card 2");
        const card3After = await fetchAccountByName(cookie, "card 3");

        expect([
          card1After.position,
          card2After.position,
          card3After.position,
        ]).toEqual([0, 1, 2]);
      });

      it("Should reposition credit cards without affecting bank account positions", async () => {
        const bank1 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "BANK",
          name: "bank 1",
        });
        const bank2 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "BANK",
          name: "bank 2",
        });
        const bank3 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "BANK",
          name: "bank 3",
        });

        const card1 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "CREDIT_CARD",
          name: "card 1",
        });
        const card2 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "CREDIT_CARD",
          name: "card 2",
        });
        const card3 = await createAccountAndReturn(cookie, {
          balance: 0,
          type: "CREDIT_CARD",
          name: "card 3",
        });

        expect([bank1.position, bank2.position, bank3.position]).toEqual([
          0, 1, 2,
        ]);
        expect([card1.position, card2.position, card3.position]).toEqual([
          0, 1, 2,
        ]);

        const res = await deleteAccount(cookie, card2.id);
        expect(res.status).toBe(200);

        const card1After = await fetchAccountByName(cookie, "card 1");
        const card3After = await fetchAccountByName(cookie, "card 3");

        expect([card1After.position, card3After.position]).toEqual([0, 1]);

        const bank1After = await fetchAccountByName(cookie, "bank 1");
        const bank2After = await fetchAccountByName(cookie, "bank 2");
        const bank3After = await fetchAccountByName(cookie, "bank 3");

        expect([
          bank1After.position,
          bank2After.position,
          bank3After.position,
        ]).toEqual([0, 1, 2]);
      });
    });
    describe("Rta months", () => {
      it("Should recalculate RTA months when deleting an account with an initial balance", async () => {
        const bank1 = await createAccountAndReturn(cookie, {
          balance: 10,
          type: "BANK",
          name: "bank 1",
        });

        const rtaMonthsBefore = await getMonthsForRtaCategory(cookie);

        expect(rtaMonthsBefore).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              available: 10,
              activity: 10,
            }),
            expect.objectContaining({
              available: 10,
              activity: 0,
            }),
          ])
        );

        const res = await deleteAccount(cookie, bank1.id);

        expect(res.status).toBe(200);

        const rtaMonthsAfter = await getMonthsForRtaCategory(cookie);

        expect(rtaMonthsAfter).toHaveLength(rtaMonthsBefore.length);

        expect(
          rtaMonthsAfter.map(({ month, available, activity }) => ({
            month,
            available,
            activity,
          }))
        ).toEqual(
          rtaMonthsBefore.map(({ month }) => ({
            month,
            available: 0,
            activity: 0,
          }))
        );
      });
    });
  });
});
