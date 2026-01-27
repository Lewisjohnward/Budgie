import { Prisma } from "@prisma/client";
import { memoRepository } from "../../../../../shared/repository/memoRepositoryImpl";
import { NoMemoFoundError } from "../../memo.errors";
import { Memo } from "../../memo.types";

/**
 * Returns a memo owned by the given user.
 *
 * @throws {NoMemoFoundError} If the memo does not exist or is not owned by the user.
 */

export const getMemo = async (
  tx: Prisma.TransactionClient,
  memoId: string,
  userId: string
): Promise<Memo> => {
  const memo = await memoRepository.getMemo(tx, userId, memoId);

  if (!memo) {
    throw new NoMemoFoundError();
  }
  return memo;
};
