import request from "supertest";
import app from "../../../app";
import { getAccounts } from "../../utils/getData";
import { fetchAccountByName } from "../../utils/account";
import { login, registerUser } from "../../utils/auth";
import { getStartingBalancePayee } from "../../utils/payee";

describe("Account - Create", () => {
  let cookie: string;

  beforeEach(async () => {
    await registerUser();
    cookie = await login();
  });

  describe("Error Cases", () => {
    it("Should return 400 on too long name", async () => {
      const testAccountData = {
        name: new Array(41).fill("a").join(),
        type: "BANK",
        balance: 0,
      };

      const resAddAccount = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountData);
      expect(resAddAccount.status).toBe(400);
    });
    it("Should return 400 on empty name", async () => {
      const testAccountData = {
        name: "",
        type: "BANK",
        balance: 0,
      };

      const resAddAccount = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountData);
      expect(resAddAccount.status).toBe(400);
    });
    it("Should return 409 on name collisions", async () => {
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

      const testAccountDataB = {
        name: "test account",
        type: "BANK",
        balance: 0,
      };

      const resAddAccountB = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountDataB);

      expect(resAddAccountB.status).toBe(409);
      const { accounts } = await getAccounts(cookie);
      const accountsArray = Object.values(accounts);
      expect(
        accountsArray.filter((a) => a.name === "test account")
      ).toHaveLength(1);
    });
  });
  describe("Race Conditions", () => {
    it("should assign unique sequential positions under concurrency", async () => {
      const create = (name: string) =>
        request(app)
          .post("/budget/account")
          .set("Authorization", `Bearer ${cookie}`)
          .send({
            name,
            type: "BANK",
          });

      await Promise.all([
        create("acc1"),
        create("acc2"),
        create("acc3"),
        create("acc4"),
      ]);

      const { accounts } = await getAccounts(cookie);

      const bankAccounts = Object.values(accounts)
        .filter((a) => a.type === "BANK")
        .sort((a, b) => a.position - b.position);

      const positions = bankAccounts.map((a) => a.position);

      expect(new Set(positions).size).toBe(positions.length);

      // Expect contiguous sequence starting from 0
      expect(positions).toEqual([0, 1, 2, 3]);
    });
  });
  describe("Success", () => {
    it("Should default balance to 0 when input is invalid", async () => {
      const inputs = ["test", "", null, undefined];

      for (const [i, balance] of inputs.entries()) {
        const testAccountData = {
          name: `test account invalid ${i}`,
          type: "BANK",
          balance,
        };

        const resAddAccount = await request(app)
          .post("/budget/account")
          .set("Authorization", `Bearer ${cookie}`)
          .send(testAccountData);
        expect(resAddAccount.status).toBe(200);

        const account = await fetchAccountByName(cookie, testAccountData.name);
        expect(account.balance).toBe(0);
      }

      const validAccountData = {
        name: "valid account",
        type: "BANK",
        balance: "123.45",
      };

      await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(validAccountData);

      const validAccount = await fetchAccountByName(
        cookie,
        validAccountData.name
      );

      expect(validAccount.balance).toBe(123.45);
    });

    const trimWhitespaceNames = [
      "test account   ",
      "   test account",
      "   test account   ",
    ];

    it.each(trimWhitespaceNames)(
      "Should trim whitespace correctly for '%s'",
      async (rawName) => {
        const trimmed = rawName.trim();

        const testAccountData = { name: rawName, type: "BANK", balance: 0 };
        const resAddAccount = await request(app)
          .post("/budget/account")
          .set("Authorization", `Bearer ${cookie}`)
          .send(testAccountData);
        expect(resAddAccount.status).toBe(200);

        await expect(fetchAccountByName(cookie, rawName)).rejects.toThrow();

        const account = await fetchAccountByName(cookie, trimmed);
        expect(account).toBeDefined();
        expect(account.name).toBe(trimmed);
      }
    );
    it("Should add an account with zero balance (FAILS BECAUSE TRANSACTIONS WITH ZERO ARE NOT SUPPORTED)", async () => {
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

      const transactions = testAccount[0].transactionIds;
      const accountData = testAccount[0];

      expect(testAccount.length).toBe(1);

      // Test all default properties
      expect(accountData.id).toBeDefined();
      expect(typeof accountData.id).toBe("string");
      expect(accountData.name).toBe(testAccountData.name);
      expect(accountData.type).toBe(testAccountData.type);
      expect(accountData.balance).toBe(0);
      expect(accountData.open).toBe(true);
      expect(accountData.deletable).toBe(true);
      expect(accountData.position).toBeDefined();
      expect(typeof accountData.position).toBe("number");
      expect(transactions.length).toBe(0);
    });
    it("Should add an account with positive balance", async () => {
      const testAccountData = {
        name: "test account",
        type: "BANK",
        balance: 100,
      };

      const resAddAccount = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountData);

      expect(resAddAccount.status).toBe(200);

      const { accounts, transactions } = await getAccounts(cookie);

      const testAccount = Object.values(accounts).filter(
        (account) => account.name === testAccountData.name
      );

      const transactionIds = testAccount[0].transactionIds;
      const accountData = testAccount[0];

      expect(testAccount.length).toBe(1);

      // Test all default properties
      expect(accountData.id).toBeDefined();
      expect(typeof accountData.id).toBe("string");
      expect(accountData.name).toBe(testAccountData.name);
      expect(accountData.type).toBe(testAccountData.type);
      expect(accountData.balance).toBe(100);
      expect(accountData.open).toBe(true);
      expect(accountData.deletable).toBe(true);
      expect(accountData.position).toBeDefined();
      expect(typeof accountData.position).toBe("number");
      expect(transactionIds.length).toBe(1);

      const accountOpeningTransactionId = transactionIds[0];
      const accountOpeningTransaction =
        transactions[accountOpeningTransactionId];

      const startingBalancePayee = await getStartingBalancePayee(cookie);
      expect(accountOpeningTransaction?.payeeId).toBe(startingBalancePayee.id);
      expect(accountOpeningTransaction.inflow).toBe(100);
      expect(accountOpeningTransaction.memo).toBe("Starting Balance");
    });
    it("Should add an account with negative balance", async () => {
      const testAccountData = {
        name: "test account",
        type: "BANK",
        balance: -100,
      };

      const resAddAccount = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountData);

      expect(resAddAccount.status).toBe(200);

      const { accounts, transactions } = await getAccounts(cookie);

      const testAccount = Object.values(accounts).filter(
        (account) => account.name === testAccountData.name
      );

      const transactionIds = testAccount[0].transactionIds;
      const accountData = testAccount[0];

      expect(testAccount.length).toBe(1);

      // Test all default properties
      expect(accountData.id).toBeDefined();
      expect(typeof accountData.id).toBe("string");
      expect(accountData.name).toBe(testAccountData.name);
      expect(accountData.type).toBe(testAccountData.type);
      expect(accountData.balance).toBe(-100);
      expect(accountData.open).toBe(true);
      expect(accountData.deletable).toBe(true);
      expect(accountData.position).toBeDefined();
      expect(typeof accountData.position).toBe("number");
      expect(transactionIds.length).toBe(1);

      const accountOpeningTransactionId = transactionIds[0];
      const accountOpeningTransaction =
        transactions[accountOpeningTransactionId];

      expect(accountOpeningTransaction.outflow).toBe(100);
    });
    it("Should assign correct positions to the accounts", async () => {
      const testAccountDataA = {
        name: "test account a",
        type: "BANK",
      };

      const resAddAccountA = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountDataA);

      const testAccountDataB = {
        name: "test account b",
        type: "BANK",
      };

      const testAccountDataC = {
        name: "test account c",
        type: "CREDIT_CARD",
      };

      const testAccountDataD = {
        name: "test account d",
        type: "CREDIT_CARD",
      };

      const resAddAccountB = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountDataB);

      const resAddAccountC = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountDataC);

      const resAddAccountD = await request(app)
        .post("/budget/account")
        .set("Authorization", `Bearer ${cookie}`)
        .send(testAccountDataD);

      expect(resAddAccountA.status).toBe(200);
      expect(resAddAccountB.status).toBe(200);
      expect(resAddAccountC.status).toBe(200);
      expect(resAddAccountD.status).toBe(200);

      const { accounts } = await getAccounts(cookie);

      const testAccountA = Object.values(accounts).filter(
        (account) => account.name === testAccountDataA.name
      );

      const testAccountB = Object.values(accounts).filter(
        (account) => account.name === testAccountDataB.name
      );

      const testAccountC = Object.values(accounts).filter(
        (account) => account.name === testAccountDataC.name
      );

      const testAccountD = Object.values(accounts).filter(
        (account) => account.name === testAccountDataD.name
      );

      const accountA = testAccountA[0];
      const accountB = testAccountB[0];
      const accountC = testAccountC[0];
      const accountD = testAccountD[0];

      expect(accountA.position).toBe(0);
      expect(accountB.position).toBe(1);
      expect(accountC.position).toBe(0);
      expect(accountD.position).toBe(1);
    });
  });
});
