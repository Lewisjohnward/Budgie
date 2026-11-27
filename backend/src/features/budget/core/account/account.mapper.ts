import { toAccountDto } from "./mappers/toAccountDto";
import { toCreateAccountDto } from "./mappers/toCreateAccountDto";
import { toDeleteAccountDto } from "./mappers/toDeleteAccountDto";
import { toDomainAccount } from "./mappers/toDomainAccount";

export const accountMapper = {
  toDomainAccount,
  toAccountDto,
  toCreateAccountDto,
  toDeleteAccountDto,
};
