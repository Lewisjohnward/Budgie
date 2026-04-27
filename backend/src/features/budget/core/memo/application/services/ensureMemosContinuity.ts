import { Prisma } from "@prisma/client";
import { memoRepository } from "../../../../../../shared/repository/memoRepositoryImpl";
import { memoMapper } from "../../memo.mapper";
import { MemoId, UpdatedMemo } from "../../memo.types";

/**
 * Updates a memo's content within a transaction and returns the updated memo as an API DTO.
 * Handles persistence via the repository and maps the DB entity to a client-safe shape.
 */
export const updateMemo = async (
  tx: Prisma.TransactionClient,
  memoId: MemoId,
  content: string
): Promise<UpdatedMemo> => {
  const memo = await memoRepository.updateMemo(tx, memoId, content);

  return memoMapper.toUpdatedMemo(memo);
};
