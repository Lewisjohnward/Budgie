import { Account, NormalizedAccountData } from "../../types/_index";
import { convertDecimalToNumber } from "../budget";

export function normalizeData(data: { accounts: Account[] }) {
  const normalizedData: NormalizedAccountData = {
    accounts: {},
    transactions: {},
    categories: {},
    categoryGroups: {},
  };

  data.accounts.forEach((account) => {
    normalizedData.accounts[account.id] = {
      id: account.id,
      userId: account.userId,
      name: account.name,
      position: account.position,
      type: account.type,
      balance: convertDecimalToNumber(account.balance),
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      transactions: [],
    };

    account.transactions.forEach((transaction) => {
      const transactionId = transaction.id;
      const categoryId = transaction.category ? transaction.category.id : null;

      normalizedData.transactions[transaction.id] = {
        ...transaction,
        inflow: convertDecimalToNumber(transaction.inflow),
        outflow: convertDecimalToNumber(transaction.outflow),
        category: categoryId,
      };
      normalizedData.accounts[account.id].transactions.push(transactionId);

      if (
        transaction.category &&
        transaction.categoryId != null &&
        !normalizedData.categories[transaction.categoryId]
      ) {
        normalizedData.categories[transaction.categoryId] = {
          id: transaction.categoryId,
          userId: transaction.category.userId,
          name: transaction.category.name,
          categoryGroupId: null,
        };

        if (transaction.category?.categoryGroupId) {
          const id = transaction.category.categoryGroupId;
          normalizedData.categories[transaction.categoryId].categoryGroupId =
            id;

          normalizedData.categoryGroups[id] = {
            ...transaction.category.categoryGroup,
          };
        }
      }
    });
  });

  return normalizedData;
}
