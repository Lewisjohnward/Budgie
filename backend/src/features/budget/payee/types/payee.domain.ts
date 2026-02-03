import { Brand } from "../../../../shared/types/brand";
import { type UserId } from "../../../user/auth/auth.types";
import { type CategoryId } from "../../category/category.types";

/**
 * A strongly-typed identifier for a payee, using a branded type for type safety.
 */
export type PayeeId = Brand<string, "PayeeId">;

/**
 * A type-casting function to treat a raw string as a `PayeeId`.
 * Use with caution, as it does not perform any validation.
 * @param id The raw string ID.
 * @returns The ID cast as a `PayeeId`.
 */
export const asPayeeId = (id: string) => id as PayeeId;

/**
 * Represents a payee in the domain layer.
 *
 * - `id` – Unique identifier for the payee.
 * - `name` – Display name of the payee.
 * - `userId` – Owner of the payee.
 * - `defaultCategoryId` – Optional default category assigned to the payee.
 * - `includeInPayeeList` – Whether the payee should appear in selection lists.
 * - `automaticallyCategorisePayee` – If true, transactions with this payee are auto-categorized.
 */
export type DomainPayee = {
  id: PayeeId;
  name: string;
  userId: UserId;
  defaultCategoryId: CategoryId | null;
  includeInPayeeList: boolean;
  automaticallyCategorisePayee: boolean;
};
