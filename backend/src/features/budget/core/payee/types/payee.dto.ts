import { PayeeOrigin } from "../payee.constants";

/**
 * Data transfer object representing a payee.
 *
 * Used to expose payee data in API responses with only the fields
 * required by the client.
 *
 * @property id - Unique identifier of the payee.
 * @property name - Display name of the payee.
 * @property origin - Source of the payee (e.g. user-created or system-generated).
 * @property defaultCategoryId - Default category assigned to this payee, if any.
 * @property includeInPayeeList - Whether the payee should appear in selectable payee lists.
 * @property automaticallyCategorisePayee - Whether transactions for this payee should be auto-categorised.
 */
export type PayeeDto = {
  id: string;
  name: string;
  origin: PayeeOrigin | null;
  defaultCategoryId: string | null;
  includeInPayeeList: boolean;
  automaticallyCategorisePayee: boolean;
};
