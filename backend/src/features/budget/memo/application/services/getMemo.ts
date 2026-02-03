import { Prisma } from "@prisma/client";
import { memoRepository } from "../../../../../shared/repository/memoRepositoryImpl";
import { NoMemoFoundError } from "../../memo.errors";
import { memoMapper } from "../../memo.mapper";
import { type DomainMemo, type MemoId } from "../../memo.types";
import { type UserId } from "../../../../user/auth/auth.types";

/**
 * Returns a memo owned by the given user.
 *
 * @throws {NoMemoFoundError} If the memo does not exist or is not owned by the user.
 */
export const getMemo = async (
  tx: Prisma.TransactionClient,
  userId: UserId,
  memoId: MemoId
): Promise<DomainMemo> => {
  const memo = await memoRepository.getMemo(tx, userId, memoId);

  if (!memo) {
    throw new NoMemoFoundError();
  }
  return memoMapper.toDomainMemo(memo);
};
