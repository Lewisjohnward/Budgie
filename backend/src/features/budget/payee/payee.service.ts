import { checkUserOwnsPayees } from "./application/services/checkUserOwnsPayees";
import { checkPayeeNameIsUnique } from "./application/services/checkPayeeNameIsUnique";
import { createPayee } from "./application/services/createPayee";
import { updatePayees } from "./application/services/updatePayees";
import { deletePayees } from "./application/services/deletePayees";
import { resolvePayeeId } from "./application/services/resolvePayeeId";

export const payeeService = {
  checkUserOwnsPayees,
  checkPayeeNameIsUnique,
  createPayee,
  updatePayees,
  deletePayees,
  resolvePayeeId,
};
