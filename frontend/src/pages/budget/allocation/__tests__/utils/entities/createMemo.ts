import { ApiMemo } from "@/core/types/exported-types";
import { defaultMonth } from "./defaults";

export function createMemo(id: string, overrides?: Partial<ApiMemo>): ApiMemo {
  return {
    id,
    month: defaultMonth,
    content: "Holiday budget",
    ...overrides,
  };
}
