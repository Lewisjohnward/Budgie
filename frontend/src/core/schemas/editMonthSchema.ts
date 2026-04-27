import { CategoryId, MonthId } from "@/pages/budget/allocation/types/types";
import { z } from "zod";

/**
 * API boundary schemas for Month-related data.
 *
 * All external data must be parsed through these schemas
 * before entering the domain layer.
 */

/**
 * Branded MonthId.
 *
 * - Must be a valid UUID at runtime
 * - Branded to prevent mixing with arbitrary strings in the domain layer
 *
 * NOTE:
 * Branding is applied at the API boundary after validation.
 */
const monthIdSchema = z
  .string()
  .uuid()
  .transform((id) => id as MonthId);

/**
 * Branded CategoryId schema.
 *
 * - Validates that the input is a UUID string at runtime
 * - Transforms the validated string into a `CategoryId` branded type
 *
 * This ensures that only valid UUIDs are accepted and that
 * category identifiers are type-safe throughout the domain layer.
 *
 * NOTE:
 * The branding is applied at the API boundary after validation.
 */
const categoryIdSchema = z
  .string()
  .uuid()
  .transform((id) => id as CategoryId);

/**
 * Month domain object as received from the API.
 *
 * This schema:
 * - Validates the raw API response
 * - Converts it into a trusted, strongly-typed domain shape
 *
 * All IDs are validated and branded at this boundary.
 */
export const monthSchema = z.object({
  id: monthIdSchema,
  categoryId: categoryIdSchema,
  month: z.string(),
  activity: z.number(),
  assigned: z.number(),
  available: z.number(),
});

/**
 * Mapping of MonthId -> Month.
 *
 * Represents a partial or full update payload returned by the API.
 *
 * Keys:
 * - Validated UUIDs
 * - Branded as MonthId
 *
 * Values:
 * - Fully validated Month objects
 */
export const updatedMonthsByIdSchema = z.record(monthIdSchema, monthSchema);

/**
 * Trusted Month domain type.
 *
 * Safe to use throughout the application after schema parsing.
 */
export type Month = z.infer<typeof monthSchema>;

/**
 * Trusted mapping of MonthId -> Month.
 *
 * Produced only after runtime validation via `updatedMonthsByIdSchema`.
 */
export type UpdatedMonthsById = z.infer<typeof updatedMonthsByIdSchema>;
