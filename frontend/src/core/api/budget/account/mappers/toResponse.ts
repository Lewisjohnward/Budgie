import {
  CreateAccountResponse,
  DeleteAccountResponse,
} from "@/core/types/exported-types";
import {
  asMonthId,
  asTransactionId,
} from "@/pages/budget/allocation/types/types";
import { mapAccount } from "../../mappers/accountMapper";
import { mapMonth } from "../../mappers/monthMapper";
import { mapNormalTransaction } from "../../mappers/transactionMapper";
import { CreateAccountResult, DeleteAccountResult } from "../types";

export const toCreateAccountResult = (
  response: CreateAccountResponse
): CreateAccountResult => ({
  created: {
    account: mapAccount(response.created.account),
    ...(response.created.transaction && {
      transaction: mapNormalTransaction(response.created.transaction),
    }),
  },
  updated: {
    months: Object.fromEntries(
      Object.entries(response.updated.months).map(([id, month]) => [
        asMonthId(id),
        mapMonth(month),
      ])
    ),
  },
});

export const toDeleteAccountResult = (
  response: DeleteAccountResponse
): DeleteAccountResult => ({
  deleted: {
    account: mapAccount(response.deleted.account),
    transactions: Object.fromEntries(
      Object.entries(response.deleted.transactions).map(([id, transaction]) => [
        asTransactionId(id),
        mapNormalTransaction(transaction),
      ])
    ),
  },
  updated: {
    months: Object.fromEntries(
      Object.entries(response.updated.months).map(([id, month]) => [
        asMonthId(id),
        mapMonth(month),
      ])
    ),
  },
});
