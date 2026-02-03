import request from "supertest";
import app from "../../app";
import {
  type EditBulkTransactionsInput,
  type EditSingleTransactionInput,
  type InsertTransactionInput,
} from "../../features/budget/transaction/transaction.schema";
import { getAccounts } from "./getData";
import { type NormalisedTransaction } from "../../features/budget/account/account.types";

/**
 * Input type for creating transactions in tests,
 * without the `userId` field.
 */
export type TestInsertTransactionInputWithoutUserId = Omit<
  InsertTransactionInput,
  "userId"
>;

/**
 * Input type for creating transactions in tests,
 * without the `userId` field.
 */
export type TestEditBulkTransactionsInputWithoutUserId = Omit<
  EditBulkTransactionsInput,
  "userId"
>;

export const addTransaction = async (
  cookie: string,
  transaction: TestInsertTransactionInputWithoutUserId,
  expectCode: number = 200
): Promise<NormalisedTransaction | void> => {
  // Create a unique memo to identify this transaction
  const uniqueId =
    Date.now().toString() + Math.random().toString(36).substring(2, 10);
  const uniqueMemo = transaction.memo
    ? `${transaction.memo}_${uniqueId}`
    : `test_transaction_${uniqueId}`;

  await request(app)
    .post("/budget/transaction")
    .set("Authorization", `Bearer ${cookie}`)
    .send({ ...transaction, memo: uniqueMemo })
    .expect(expectCode);

  if (expectCode != 200) {
    return;
  }

  // Find the transaction with our unique memo
  const { transactions } = await getAccounts(cookie);

  const createdTransaction = Object.values(transactions).find(
    (t) => t.memo === uniqueMemo
  );

  if (!createdTransaction) {
    throw Error("Unable to find added transaction");
  }

  return createdTransaction;
};

export const deleteTransactions = async (
  cookie: string,
  transactionIds: string[],
  expectCode: number = 200
) => {
  await request(app)
    .delete("/budget/transaction")
    .set("Authorization", `Bearer ${cookie}`)
    .send({ transactionIds })
    .expect(expectCode);
};

export const editTransactions = async (
  cookie: string,
  transactionsToUpdate: any,
  expectCode: number = 200
) => {
  await request(app)
    .patch("/budget/transaction")
    .set("Authorization", `Bearer ${cookie}`)
    .send({ transactions: transactionsToUpdate })
    .expect(expectCode);
};

export const duplicateTransactions = async (
  cookie: string,
  transactionsToDuplicate: string[],
  expectCode: number = 200
) => {
  await request(app)
    .post("/budget/transaction/duplicate")
    .set("Authorization", `Bearer ${cookie}`)
    .send({ transactionIds: transactionsToDuplicate })
    .expect(expectCode);
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

export const editSingleTransaction = async (
  cookie: string,
  id: string,
  payload: EditSingleTransactionInput
) => {
  const res = await request(app)
    .patch(`/budget/transaction/${id}`)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  let updatedTransaction = null;
  if (res.status === 200) {
    const { transactions } = await getAccounts(cookie);
    updatedTransaction =
      Object.values(transactions).find((t) => t.id === id) ?? null;
  }

  return { res, updatedTransaction };
};

export const editBulkTransactions = async (
  cookie: string,
  payload: TestEditBulkTransactionsInputWithoutUserId
) => {
  const res = await request(app)
    .patch(`/budget/transaction/bulk`)
    .set("Authorization", `Bearer ${cookie}`)
    .send(payload);

  return {
    res,
  };
};
