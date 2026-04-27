import { accountRepository } from "../../../../../../shared/repository/accountRepositoryImpl";
import { type DomainAccount } from "../../account.types";
import { accountMapper } from "../../account.mapper";
import { type UserId } from "../../../../../user/auth/auth.types";

export const getAccounts = async (userId: UserId): Promise<DomainAccount[]> => {
  const rawAccounts = await accountRepository.getAccounts(userId);

  return rawAccounts.map(accountMapper.toDomainAccount);
};
