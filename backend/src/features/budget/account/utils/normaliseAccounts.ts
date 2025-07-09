import { convertDecimalToNumber } from "../../../../shared/utils/convertDecimalToNumber";
import { Account } from "../../category/category.types";
import { NormalisedAccounts } from "../account.schema";

export function normaliseAccounts(data: { accounts: Account[] }) {
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
      const categoryId = transaction.category ? transaction.category.id : null;

      normalisedData.transactions[transaction.id] = {
        ...transaction,
        inflow: convertDecimalToNumber(transaction.inflow),
        outflow: convertDecimalToNumber(transaction.outflow),
        category: categoryId,
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
