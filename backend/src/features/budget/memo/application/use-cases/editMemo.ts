import { prisma } from "../../../../../shared/prisma/client";
import { memoRepository } from "../../../../../shared/repository/memoRepositoryImpl";
import { EditMemoPayload } from "../../memo.schema";
import { memoService } from "../../memo.service";

/**
 * Updates the content of a memo owned by the given user.
 *
 * Performs the update atomically and enforces memo existence
 * and ownership via the memo service.
 *
 * @param userId - ID of the user editing the memo
 * @param payload - Validated edit memo payload
 *
 * @throws {NoMemoFoundError}
 * Thrown if the memo does not exist or is not owned by the user.
 */

export const editMemo = async (userId: string, payload: EditMemoPayload) => {
  const { id, content } = payload;

  await prisma.$transaction(async (tx) => {
    await memoService.getMemo(tx, id, userId);

    await memoRepository.updateMemo(tx, id, content);
  });
};
