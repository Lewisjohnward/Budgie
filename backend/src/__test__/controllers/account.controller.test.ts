import request from "supertest";
import { login, registerUser } from "../utils/auth";
import { getAccounts } from "../utils/getData";
import app from "../../app";

describe("Account", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });
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
        (account) => account.name === testAccountData.name
      );

      const transactions = testAccount[0].transactions;
      const accountData = testAccount[0];

      expect(testAccount.length).toBe(1);

      // Test all default properties
      expect(accountData.id).toBeDefined();
      expect(typeof accountData.id).toBe("string");
      expect(accountData.name).toBe(testAccountData.name);
      expect(accountData.type).toBe(testAccountData.type);
      expect(accountData.balance).toBe(0);
      expect(accountData.open).toBe(true);
      expect(accountData.position).toBeDefined();
      expect(typeof accountData.position).toBe("number");
      expect(accountData.createdAt).toBeDefined();
      expect(accountData.updatedAt).toBeDefined();
      expect(transactions.length).toBe(0);
    });
  });

  describe("delete", () => {
    it.todo("should throw error if account not owned by user/found");
    it.todo("should delete account if it has transactions and zero balance");
    it.todo(
      "should close account and zero balance if it has transactions and non zero balance"
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
