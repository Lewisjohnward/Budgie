/**
 * Data transfer object representing a memo associated with a specific month.
 *
 * Used to expose memo data in API responses in a simplified, serializable format.
 *
 * @property id - Unique identifier of the memo.
 * @property month - Only the year-month portion (`YYYY-MM`) is retained
 * @property content - Text content of the memo.
 */
export type MemoDto = {
  id: string;
  month: string;
  content: string;
};
