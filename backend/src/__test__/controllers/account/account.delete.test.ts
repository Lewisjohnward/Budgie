import { v4 as uuidv4 } from "uuid";
import { login, registerUser } from "../../utils/auth";
import { getAccounts } from "../../utils/getData";
import { deleteAccount, fetchAccountByName } from "../../utils/account";
import { createAccount } from "../../utils/account";
import {
  addTransaction,
  getTransactionsForAccountId,
  TestInsertTransactionInputWithoutUserId,
} from "../../utils/transaction";

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

      await addTransaction(cookie, transaction);
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
});
