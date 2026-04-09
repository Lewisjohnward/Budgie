import { convertDecimalToNumber } from "../../../../shared/utils/convertDecimalToNumber";
import { db } from "../../category/core/category.types";
import { type NormalisedAccounts } from "../account.types";

export function normaliseAccounts(data: { accounts: db.Account[] }) {
  const normalisedData: NormalisedAccounts = {
    accounts: {},
    transactions: {},
    categories: {},
    categoryGroups: {},
  };

  data.accounts.forEach((account) => {
    normalisedData.accounts[account.id] = {
      id: account.id,
      userId: account.userId,
      name: account.name,
      open: account.open,
      position: account.position,
      deletable: account.deletable,
      type: account.type,
      balance: convertDecimalToNumber(account.balance),
      transactionIds: [],
    };

    account.transactions.forEach((transaction) => {
      const transactionId = transaction.id;

      normalisedData.transactions[transaction.id] = {
        id: transaction.id,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        payeeId: transaction.payeeId,
        date: transaction.date,
        inflow: convertDecimalToNumber(transaction.inflow),
        outflow: convertDecimalToNumber(transaction.outflow),
        transferAccountId: transaction.transferAccountId,
        transferTransactionId: transaction.transferTransactionId,
        memo: transaction.memo,
        cleared: transaction.cleared,
      };
      //@ts-ignore-error: needs branding
      normalisedData.accounts[account.id].transactionIds.push(transactionId);

      if (
        transaction.category &&
        transaction.categoryId != null &&
        !normalisedData.categories[transaction.categoryId]
      ) {
        normalisedData.categories[transaction.categoryId] = {
          id: transaction.categoryId,
          userId: transaction.category.userId,
          name: transaction.category.name,
          categoryGroupId: null,
        };

        if (transaction.category?.categoryGroupId) {
          const id = transaction.category.categoryGroupId;
          normalisedData.categories[transaction.categoryId].categoryGroupId =
            id;

          normalisedData.categoryGroups[id] = {
            ...transaction.category.categoryGroup,
          };
        }
      }
    });
  });

  return normalisedData;
}
