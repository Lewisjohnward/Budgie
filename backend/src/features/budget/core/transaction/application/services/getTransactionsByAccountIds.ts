import { transactionRepository } from "../../../../../../shared/repository/transactionRepositoryImpl";
import { type DomainTransaction } from "../../transaction.types";
import { transactionMapper } from "../../transaction.mapper";
import { type AccountId } from "../../../account/account.types";

export const getTransactionsByAccountIds = async (
  accountIds: AccountId[],
  range: { from?: Date; to?: Date }
): Promise<DomainTransaction[]> => {
  const rawTransactions =
    await transactionRepository.getTransactionsByAccountIds(accountIds, range);

  return rawTransactions.map(transactionMapper.toDomainTransaction);
};
