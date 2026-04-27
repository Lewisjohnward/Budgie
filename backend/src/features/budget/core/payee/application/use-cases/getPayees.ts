import { normalisePayees } from "../../utils/normalisePayees";
import { asUserId } from "../../../../../user/auth/auth.types";
import { NormalisedPayees } from "../../payee.types";
import { payeeService } from "../../payee.service";

/**
 * Fetches all payees for a user and returns them in a normalized structure.
 *
 * This includes:
 * - **Regular payees**: user-created entities representing merchants, vendors, or common payees.
 * - **Account payees**: special payees corresponding to the user's accounts, used for transfer transactions.
 *
 * The results are normalized for fast lookup, with each payee keyed by its ID.
 *
 * @param userId - The ID of the user whose payees are being retrieved.
 *
 * @returns A promise that resolves to an object containing:
 *  - `payees`: Map of regular payees keyed by payee ID.
 *  - `accountPayees`: Map of account payees keyed by payee ID.
 *
 * @example
 * const { payees, accountPayees } = await getPayees("user-123");
 * console.log(payees["payee-1"].name);
 */

export const getPayees = async (userId: string): Promise<NormalisedPayees> => {
  const uId = asUserId(userId);

  const payees = await payeeService.getPayees(uId);

  return normalisePayees(payees);
};
