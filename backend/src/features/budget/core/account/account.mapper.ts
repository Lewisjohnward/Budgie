import { toAccountDto } from "./mappers/toAccountDto";
import { toDomainAccount } from "./mappers/toDomainAccount";

export const accountMapper = {
  toDomainAccount,
  toAccountDto,
};
