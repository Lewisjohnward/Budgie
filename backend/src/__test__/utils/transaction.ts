import request from "supertest";
import app from "../../app";

type Transaction = {
  outflow?: string;
  inflow?: string;
  memo?: string;
  date?: string;
  categoryId?: string;
  accountId: string;
};

export const addTransaction = async (
  cookie: string,
  transaction: Transaction,
) => {
  return await request(app)
    .post("/budget/transaction")
    .set("Authorization", `Bearer ${cookie}`)
    .send(transaction);
};

const testAccountData = {
  name: "test account",
  type: "BANK",
  balance: 0,
};

export const addAccount = async (cookie: string) => {
  return await request(app)
    .post("/budget/account")
    .set("Authorization", `Bearer ${cookie}`)
    .send(testAccountData);
};