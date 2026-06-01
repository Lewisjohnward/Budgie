import { toDomainAnyTransaction } from "./mappers/toDomainAnyTransaction";
import { toDomainTransaction } from "./mappers/toDomainTransaction";
import { toDomainNormalTransaction } from "./mappers/toDomainNormalTransaction";
import { toDomainTransferSourceTransaction } from "./mappers/toDomainTransferSourceTransaction";
import { toDomainTransferTransaction } from "./mappers/toDomainTransferTransaction";
import { toCreateTransactionDto } from "./mappers/toCreateTransactionDto";
import { toTransactionDto } from "./mappers/toTransactionDto";

export const transactionMapper = {
  toDomainTransaction,
  toDomainNormalTransaction,
  toDomainTransferSourceTransaction,
  toDomainAnyTransaction,
  toDomainTransferTransaction,

  toTransactionDto,

  toCreateTransactionDto,
};
