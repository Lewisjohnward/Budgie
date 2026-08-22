import { ApiMonth } from "@/core/types/exported-types";

export function createMonth(
  id: string,
  categoryId: string,
  overrides?: Partial<ApiMonth>
): ApiMonth {
  return {
    id,
    categoryId,
    month: "2026-07",
    activity: 0,
    available: 0,
    assigned: 0,
    ...overrides,
  };
}
