import { prisma } from "../../../../../shared/prisma/client";
import { memoRepository } from "../../../../../shared/repository/memoRepositoryImpl";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";
import { type EditMemoPayload } from "../../memo.schema";
import { memoService } from "../../memo.service";
import { asMemoId, type MemoId } from "../../memo.types";

/**
 * Represents the internal command used to edit a memo.
 *
 * This type transforms the external `EditMemoPayload` by replacing the
 * raw `memoId` string with a strongly-typed `MemoId`.
 *
 * @remarks
 * - Used internally within the application layer.
 * - Ensures ID type-safety before reaching domain or repository logic.
 * - Prevents accidental mixing of unrelated string IDs.
 */
type EditMemoCommand = Omit<EditMemoPayload, "userId" | "memoId"> & {
  userId: UserId;
  memoId: MemoId;
};

/**
 * Transforms a validated `EditMemoPayload` into an `EditMemoCommand`.
 *
 * Converts the raw `memoId` string into a branded `MemoId`
 * to enforce stronger type safety inside the application.
 *
 * @param p - The validated edit memo payload received from the request layer.
 * @returns The transformed command with a strongly-typed `memoId`.
 *
 * @example
 * const command = toEditMemoCommand({
 *   memoId: "memo-123",
 *   content: "Updated memo content"
 * });
 */
const toEditMemoCommand = (p: EditMemoPayload): EditMemoCommand => ({
  ...p,
  userId: asUserId(p.userId),
  memoId: asMemoId(p.memoId),
});

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
export const editMemo = async (payload: EditMemoPayload) => {
  const { userId, memoId, content } = toEditMemoCommand(payload);

  await prisma.$transaction(async (tx) => {
    await memoService.getMemo(tx, userId, memoId);

    await memoRepository.updateMemo(tx, memoId, content);
  });
};
