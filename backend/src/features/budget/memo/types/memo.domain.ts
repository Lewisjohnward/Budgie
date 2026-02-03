import { Brand } from "../../../../shared/types/brand";
import { type UserId } from "../../../user/auth/auth.types";

/**
 * A strongly-typed identifier for a memo, using a branded type for type safety.
 */
export type MemoId = Brand<string, "TransactionId">;

/**
 * A type-casting function to treat a raw string as a `MemoId`.
 * Use with caution, as it does not perform any validation.
 * @param id The raw string ID.
 * @returns The ID cast as a `MemoId`.
 */
export const asMemoId = (id: string) => id as MemoId;

// memo.domain.ts
export type DomainMemo = {
  id: MemoId;
  userId: UserId;
  month: Date;
  content: string;
};
