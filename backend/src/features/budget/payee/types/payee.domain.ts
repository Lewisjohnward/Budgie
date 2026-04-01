import { Brand } from "../../../../shared/types/brand";
import { type UserId } from "../../../user/auth/auth.types";
import { type CategoryId } from "../../category/category.types";
import { PayeeOrigin } from "../payee.constants";

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
 * Fields:
 * - `id` – Unique identifier for the payee.
 * - `name` – Display name of the payee.
 * - `userId` – Owner of the payee.
 * - `origin` – Source of the payee. Can be:
 *     - `system` for built-in payees
 *     - `user` for user-created payees
 *     - `null` for legacy payees created before origin tracking was added.
 * - `defaultCategoryId` – Optional default category assigned to the payee.
 * - `includeInPayeeList` – Whether the payee should appear in selection lists.
 * - `automaticallyCategorisePayee` – If true, transactions with this payee are auto-categorized.
 *
 * @remarks
 * The `origin` field is currently nullable to support existing data. Once all legacy payees
 * are migrated, this can be made non-nullable.
 */
export type DomainPayee = {
  id: PayeeId;
  name: string;
  userId: UserId;
  // TODO:(lewis 2026-04-01 08:42) null needs to be removed when existing counts are updated
  origin: PayeeOrigin | null;
  defaultCategoryId: CategoryId | null;
  includeInPayeeList: boolean;
  automaticallyCategorisePayee: boolean;
};
