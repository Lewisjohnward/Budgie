
import { createAccount } from "./application/use-cases/createAccount";
import { deleteAccount } from "./application/use-cases/deleteAccount";
import { selectAccounts } from "./application/use-cases/selectAccounts";
import { updateAccount } from "./application/use-cases/updateAccount";

export const accountUseCase = {
  getAccounts: selectAccounts,
  deleteAccount: deleteAccount,
  createAccount: createAccount,
  updateAccount: updateAccount,
};