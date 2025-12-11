import { normalisePayees } from "../../utils/normalisePayees";
import { payeeRepository } from "../../../../../shared/repository/payeeRepositoryImpl";
import { prisma } from "../../../../../shared/prisma/client";

/**
 * Retrieves all payees and account payees for a user and returns them in a normalized format.
 *
 * Regular payees are user-created entities for tracking merchants, vendors, etc.
 * Account payees represent accounts that can be used as transfer destinations in transactions.
 *
 * @param userId - The ID of the user whose payees to retrieve
 * @returns A normalized object containing both payees and accountPayees, each keyed by their respective IDs
 */

export const getPayees = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const payees = await payeeRepository.getPayees(tx, userId);

    return normalisePayees(payees);
  });
};
