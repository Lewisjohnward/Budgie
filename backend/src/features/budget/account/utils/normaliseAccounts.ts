import { convertDecimalToNumber } from "../../../../shared/utils/convertDecimalToNumber";
import { db } from "../../category/category.types";
import { NormalisedAccounts } from "../account.schema";

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
      type: account.type,
      balance: convertDecimalToNumber(account.balance),
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      transactions: [],
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
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      };
      normalisedData.accounts[account.id].transactions.push(transactionId);

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
