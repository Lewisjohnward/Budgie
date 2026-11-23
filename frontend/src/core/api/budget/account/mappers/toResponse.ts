import { CreateAccountResponse } from "@/core/types/exported-types";
import { asMonthId } from "@/pages/budget/allocation/types/types";
import { mapAccount } from "../../mappers/accountMapper";
import { mapMonth } from "../../mappers/monthMapper";
import { mapNormalTransaction } from "../../mappers/transactionMapper";
import { CreateAccountResult } from "../types";

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
