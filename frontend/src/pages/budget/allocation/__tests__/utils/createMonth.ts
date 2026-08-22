import { ApiMonth } from "@/core/types/exported-types";
import { defaultMonth } from "./entities/defaults";

export function createMonth(
  id: string,
  categoryId: string,
  overrides?: Partial<ApiMonth>
): ApiMonth {
  return {
    id,
    categoryId,
    month: defaultMonth,
    activity: 0,
    available: 0,
    assigned: 0,
    ...overrides,
  };
}
