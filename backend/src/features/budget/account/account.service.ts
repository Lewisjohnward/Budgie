import { getAccount } from "./application/services/getAccount";
import { updateAccountBalances } from "./application/services/updateAccountBalances";
import { refreshDeletableStatus } from "./application/services/refreshDeletableStatus";
import { createAccount } from "./application/services/createAccount";
import { deleteAccount } from "./application/services/deleteAccount";
import { adjustAccountBalance } from "./application/services/adjustAccountBalance";
import { updateAccountName } from "./application/services/updateAccountName";
import { getNextPosition } from "./application/services/getNextPosition";

export const accountService = {
  createAccount,
  getAccount,
  deleteAccount,

  updateAccountBalances,
  getNextPosition,

  refreshDeletableStatus,
  updateAccountName,
  adjustAccountBalance,
};
