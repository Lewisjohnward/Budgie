import { z } from "zod";

/**
 * Schema for editing a single memo.
 *
 * - `id` identifies the memo to edit
 * - `content` is the full memo text (max 300 characters)
 */

export const editMemoSchema = z.object({
  id: z.string().uuid(),
  content: z.string().max(300),
});

/**
 * Validated payload for editing a memo.
 * Derived from `editMemoSchema`.
 */

export type EditMemoPayload = z.output<typeof editMemoSchema>;
