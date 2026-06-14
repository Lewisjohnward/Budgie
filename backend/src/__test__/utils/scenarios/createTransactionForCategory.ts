import { createAccountAndFetch } from "../account";
import { addTransactionLegacy } from "../transaction";

export const createTransactionForCategory = async (
  cookie: string,
  categoryId: string,
  amount = "4"
) => {
  const account = await createAccountAndFetch(cookie, 0);

  await addTransactionLegacy(cookie, {
    accountId: account.id,
    categoryId,
    outflow: amount,
  });

  return account;
};
