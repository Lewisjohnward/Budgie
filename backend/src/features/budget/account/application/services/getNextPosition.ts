import { Prisma } from "@prisma/client";

/**
 * Computes the next position index for an account within a user's account type group.
 *
 * Positions are assigned sequentially starting from 0, and are scoped by both
 * `userId` and `type` (e.g., BANK and CREDIT_CARD maintain independent sequences).
 *
 * This function queries the current maximum `position` for the given user and type,
 * and returns the next available position (`max + 1`). If no accounts exist yet,
 * it returns `0`.
 *
 * @param tx - Prisma transaction client used to ensure consistency within a transaction.
 * @param userId - The ID of the user who owns the accounts.
 * @param type - The account type ("BANK" or "CREDIT_CARD") used to scope the position sequence.
 *
 * @returns The next available position as a number.
 *
 * @example
 * const position = await getNextPosition(tx, userId, "BANK");
 * // → 0 (if no accounts exist) or max position + 1
 *
 * @remarks
 * This function should be called within a transaction to avoid race conditions
 * when multiple accounts are created concurrently.
 */

export async function getNextPosition(
  tx: Prisma.TransactionClient,
  userId: string,
  type: "BANK" | "CREDIT_CARD"
) {
  const result = await tx.account.aggregate({
    where: {
      userId,
      type,
    },
    _max: {
      position: true,
    },
  });

  return (result._max.position ?? -1) + 1;
}
