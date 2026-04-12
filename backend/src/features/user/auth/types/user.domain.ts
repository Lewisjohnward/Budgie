import { Brand } from "../../../../shared/types/brand";

/**
 * A strongly-typed identifier for a user, using a branded type for type safety.
 */
export type UserId = Brand<string, "UserId">;

export type HashedPassword = Brand<string, "HashedPassword">;

export type Salt = Brand<string, "Salt">;

/**
 * A type-casting function to treat a raw string as a `MemoId`.
 * Use with caution, as it does not perform any validation.
 * @param id The raw string ID.
 * @returns The ID cast as a `MemoId`.
 */
export const asUserId = (id: string) => id as UserId;

export type DomainUser = {
  id: UserId;
  email: string;
  password: string;
  salt: string;
};
