import { toDomainAnyTransaction } from "./mappers/toDomainAnyTransaction";
import { toDomainTransaction } from "./mappers/toDomainTransaction";
import { toDomainNormalTransaction } from "./mappers/toDomainNormalTransaction";
import { toDomainTransferSourceTransaction } from "./mappers/toDomainTransferSourceTransaction";

export const transactionMapper = {
  toDomainTransaction,
  toDomainNormalTransaction,
  toDomainTransferSourceTransaction,
  toDomainAnyTransaction,
};
