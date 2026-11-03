import { toDomainAnyTransaction } from "./mappers/toDomainAnyTransaction";
import { toDomainTransaction } from "./mappers/toDomainTransaction";
import { toDomainNormalTransaction } from "./mappers/toDomainNormalTransaction";
import { toDomainTransferSourceTransaction } from "./mappers/toDomainTransferSourceTransaction";
import { toDomainTransferTransaction } from "./mappers/toDomainTransferTransaction";
import { toCreateTransactionDto } from "./mappers/toCreateTransactionDto";
import { toTransactionDto } from "./mappers/toTransactionDto";
import { toTransactionNormalDto } from "./mappers/toTransactionNormalDto";
import { toTransactionTransferDto } from "./mappers/toTransactionTransferDto";
import { toEditTransactionsBulkDto } from "./mappers/toEditTransactionsBulkDto";
import { toCreatedTransactions } from "./mappers/toCreatedTransactions";
import { toDuplicateTransactionsDto } from "./mappers/toDuplicateTransactionsDto";
import { toDeleteTransactionsDto } from "./mappers/toDeleteTransactionsDto";
import { snapshotToDomainTransaction } from "./mappers/snapshotToDomainTransaction";
import { toEditTransactionDto } from "./mappers/toEditTransactionDto";

export const transactionMapper = {
  toCreatedTransactions,
  snapshotToDomainTransaction,

  toDomainTransaction,
  toDomainNormalTransaction,
  toDomainTransferSourceTransaction,
  toDomainAnyTransaction,
  toDomainTransferTransaction,

  toTransactionDto,
  toTransactionNormalDto,
  toTransactionTransferDto,

  toCreateTransactionDto,
  toDeleteTransactionsDto,
  toEditTransactionDto,
  toDuplicateTransactionsDto,
  toEditTransactionsBulkDto,
};
