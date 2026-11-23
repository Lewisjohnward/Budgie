import { CreateAccountRequest } from "@/core/types/exported-types";
import { CreateAccountInput } from "../types";

export const toCreateAccountRequest = (
  input: CreateAccountInput
): CreateAccountRequest => ({
  name: input.name,
  type: input.type,
  balance: input.balance,
});
