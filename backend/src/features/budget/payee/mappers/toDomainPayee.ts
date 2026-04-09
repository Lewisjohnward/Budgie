import { asUserId } from "../../../user/auth/auth.types";
import { asCategoryId } from "../../category/core/category.types";
import { asPayeeId, type db, type DomainPayee } from "../payee.types";

/**
 * Maps a raw database payee record to a domain-safe `DomainPayee`.
 *
 * - Casts `id` to a branded `PayeeId`.
 * - Converts `defaultCategoryId` to a branded `CategoryId`, preserving `null`.
 *
 * @param row - The raw payee record from the database
 * @returns A `DomainPayee` object safe for use in the domain layer
 */
export const toDomainPayee = (row: db.Payee): DomainPayee => {
  return {
    ...row,
    defaultCategoryId:
      row.defaultCategoryId === null
        ? null
        : asCategoryId(row.defaultCategoryId),
    id: asPayeeId(row.id),
    userId: asUserId(row.userId),
    origin: row.origin,
  };
};
