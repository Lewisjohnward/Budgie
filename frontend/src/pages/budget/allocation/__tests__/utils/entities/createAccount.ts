import { ApiAccount } from "@/core/types/exported-types";

export function createAccount(
  id: string,
  overrides?: Partial<ApiAccount>
): ApiAccount {
  return {
    id,
    name: "default",
    position: 0,
    open: true,
    type: "BANK",
    deletable: false,
    balance: 0,
    ...overrides,
  };
}
