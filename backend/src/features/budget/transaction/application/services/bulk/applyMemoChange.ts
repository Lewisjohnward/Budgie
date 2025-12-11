import { Prisma } from "@prisma/client";
import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";

/**
 * Applies a memo change to a set of transactions.
 *
 * This function performs a bulk update of the `memo` field for the provided
 * transaction IDs. It does not enforce additional domain invariants and does
 * not perform any derived updates (e.g. balances, categories, or transfers).
 *
 * Ownership and existence validation are expected to be handled by the caller.
 *
 * @param {Prisma.TransactionClient} tx
 *        Prisma transaction client. The update is executed within this
 *        transaction scope.
 * @param {string[]} transactionIds
 *        IDs of the transactions whose memo should be updated.
 * @param {string} memo
 *        Memo value to apply to all specified transactions.
 *
 * @returns {Promise<void>}
 */

export const applyMemoChange = async (
  tx: Prisma.TransactionClient,
  transactionIds: string[],
  memo: string
): Promise<void> => {
  await transactionRepository.bulkUpdateMemo(tx, transactionIds, memo);
};
