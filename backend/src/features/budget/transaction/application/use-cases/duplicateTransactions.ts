import { OperationMode } from "../../../../../shared/enums/operation-mode";
import { prisma } from "../../../../../shared/prisma/client";
import { transactionRepository } from "../../../../../shared/repository/transactionRepositoryImpl";
import { accountService } from "../../../account/account.service";
import { categoryService } from "../../../category/category.service";
import { transactionService } from "../../transaction.service";
import { createDuplicatedTxs } from "../../utils/createDuplicateTxs";
import { duplicateTransferTransactions } from "../../utils/duplicateTransferTransactions";
import { splitTransactionsByType } from "../../utils/splitTransactionsByType";
import { type DuplicateTransactionsPayload } from "../../transaction.schema";
import { asTransactionId, type TransactionId } from "../../transaction.types";
import { asUserId, type UserId } from "../../../../user/auth/auth.types";
import { payeeService } from "../../../payee/payee.service";
import { sanitizeSystemPayee } from "../../utils/sanitiseSystemPayee";
import { getUniqueAccountIds } from "../../utils/getUniqueAccountIds";

/**
 * Command type for duplicating transactions.
 *
 * Wraps `DuplicateTransactionsPayload` and brands the transaction IDs.
 */
export type DuplicateTransactionsCommand = Omit<
  DuplicateTransactionsPayload,
  "userId" | "transactionIds"
> & {
  userId: UserId;
  transactionIds: TransactionId[];
};

/**
 * Converts a raw duplicate transactions payload into a command with branded IDs.
 *
 * @param payload - The raw duplication payload from API or caller
 * @returns A payload with transaction IDs properly branded
 */
export const toDuplicateTransactionsCommand = (
  p: DuplicateTransactionsPayload
): DuplicateTransactionsCommand => ({
  ...p,
  userId: asUserId(p.userId),
  transactionIds: p.transactionIds.map((p) => asTransactionId(p)),
});

/**
 * Duplicates a set of transactions for a given user inside a single database transaction.
 *
 * The duplication process preserves logical relationships (e.g. transfers) while ensuring
 * all derived data (category months, RTA, balances) is correctly recalculated.
 *
 * Workflow:
 * 1. Converts the raw payload into a typed command (brands IDs)
 * 2. Fetches all target transactions, including transfer pairs
 * 3. Sanitizes system-generated payees so duplicates behave like user-created transactions
 * 4. Splits transactions into:
 *    - Transfer transactions (handled as linked pairs)
 *    - RTA (Ready To Assign) transactions
 *    - Non-RTA (regular) transactions
 * 5. Generates duplicated transactions with new identities and timestamps
 * 6. Recalculates:
 *    - Category months for non-RTA transactions
 *    - RTA activity and available amounts
 * 7. Persists duplicated transactions
 * 8. Updates account balances and deletable status
 *
 * All operations are executed atomically via `prisma.$transaction`.
 *
 * @param payload - Raw duplication payload containing:
 *   - userId: string
 *   - transactionIds: string[]
 *
 * @returns A promise that resolves once duplication and all side effects are complete
 *
 * @throws {NoTransactionsFoundError}
 * Thrown if none of the provided transaction IDs can be resolved
 *
 * @example
 * await duplicateTransactions({
 *   userId: "user-123",
 *   transactionIds: ["tx-1", "tx-2"]
 * });
 */
export const duplicateTransactions = async (
  payload: DuplicateTransactionsPayload
): Promise<void> => {
  const { userId, transactionIds } = toDuplicateTransactionsCommand(payload);

  await prisma.$transaction(async (tx) => {
    const { normalTransactions, allTransferTransactions } =
      await transactionService.getTransactionsWithPairs(
        tx,
        userId,
        transactionIds
      );

    const rtaCategoryId = await categoryService.rta.getRtaCategoryId(
      tx,
      userId
    );

    const duplicatedTransferTxs = duplicateTransferTransactions(
      allTransferTransactions
    );

    const systemPayeeIds = await payeeService.getSystemPayeeIds(tx, userId);

    // Ensure system payees are cleared before duplication, so duplicates appear as user transactions with no payee
    const sanitizedNormalTransactions = normalTransactions.map((tx) =>
      sanitizeSystemPayee(tx, systemPayeeIds)
    );

    const { rtaTransactions, nonRtaTransactions } = splitTransactionsByType(
      sanitizedNormalTransactions,
      rtaCategoryId
    );

    const duplicatedNonRtaTxs = createDuplicatedTxs(nonRtaTransactions);
    const duplicatedRtaTxs = createDuplicatedTxs(rtaTransactions);

    // update months for duplicated transactions
    if (nonRtaTransactions.length > 0) {
      await categoryService.months.recalculateCategoryMonthsForTransactions(
        tx,
        nonRtaTransactions,
        OperationMode.Add
      );
    }

    // update rta activity and then recalculate rta months available
    if (rtaTransactions.length > 0) {
      await categoryService.rta.updateMonthsActivityForTransactions(
        tx,
        userId,
        rtaCategoryId,
        rtaTransactions,
        OperationMode.Add
      );
    }

    await categoryService.rta.calculateMonthsAvailable(
      tx,
      userId,
      rtaCategoryId
    );

    // Insert all transactions
    await transactionRepository.createTransactions(tx, [
      ...duplicatedTransferTxs,
      ...duplicatedRtaTxs,
      ...duplicatedNonRtaTxs,
    ]);

    // Update account balances for the duplicated transfers
    await accountService.updateAccountBalances(
      tx,
      [...duplicatedTransferTxs, ...rtaTransactions, ...nonRtaTransactions],
      OperationMode.Add
    );

    await accountService.refreshDeletableStatus(
      tx,
      getUniqueAccountIds([
        ...duplicatedNonRtaTxs,
        ...duplicatedRtaTxs,
        ...duplicatedTransferTxs,
      ])
    );
  });
};
