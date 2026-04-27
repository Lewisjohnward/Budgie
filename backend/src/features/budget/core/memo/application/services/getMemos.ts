import { memoRepository } from "../../../../../../shared/repository/memoRepositoryImpl";
import { memoMapper } from "../../memo.mapper";
import { type DomainMemo } from "../../memo.types";
import { type UserId } from "../../../../../user/auth/auth.types";

export const getMemos = async (userId: UserId): Promise<DomainMemo[]> => {
  const rawMemos = await memoRepository.getMemos(userId);

  return rawMemos.map(memoMapper.toDomainMemo);
};
