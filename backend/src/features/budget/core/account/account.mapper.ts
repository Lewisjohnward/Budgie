import { toAccountDto } from "./mappers/toAccountDto";
import { toCreateAccountDto } from "./mappers/toCreateAccountDto";
import { toDomainAccount } from "./mappers/toDomainAccount";

export const accountMapper = {
  toDomainAccount,
  toAccountDto,
  toCreateAccountDto,
};
