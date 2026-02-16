import { createAccount } from "./application/use-cases/createAccount";
import { deleteAccount } from "./application/use-cases/deleteAccount";
import { selectAccounts } from "./application/use-cases/selectAccounts";
import { toggleAccountOpen } from "./application/use-cases/toggleAccountOpen";
import { editAccount } from "./application/use-cases/updateAccount";

export const accountUseCase = {
  getAccounts: selectAccounts,
  deleteAccount,
  createAccount,
  editAccount,
  toggleAccountOpen,
};
