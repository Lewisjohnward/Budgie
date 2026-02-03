import { Prisma } from "@prisma/client";
import { TransactionSnapshot } from "./getTransactionSnapshotWithPair";
import { ZERO } from "../../../../../../shared/constants/zero";
import { categoryService } from "../../../../category/category.service";
import { accountService } from "../../../../account/account.service";
import { payeeService } from "../../../../payee/payee.service";
import { type EditTransactionCommand } from "./editTransaction";
import { type AccountId } from "../../../../account/account.types";
import { type UserId } from "../../../../../user/auth/auth.types";

/**
 * Represents a fully-resolved intent to edit a single transaction.
 *
 * This intent is the output of the edit resolution phase and contains:
 *
 * - `updateData`: a Prisma-compatible update object for the main transaction
 * - `transfer`: a resolved transfer intent describing how transfer-related
 *   records should be created, updated, or removed
 *
 * The intent is designed to be applied later as part of a transactional
 * workflow that handles persistence and side effects (balances, months, etc).
 */

export type EditTransactionIntent = {
  updateData: Prisma.TransactionUncheckedUpdateInput;
  transfer: TransferIntent;
};

/**
 * Describes how the transfer relationship of a transaction should change.
 *
 * This intent represents a *lifecycle transition* for transfers and is
 * resolved independently from other field updates.
 *
 * Variants:
 * - `none`   — no change to transfer state
 * - `remove` — convert a transfer into a normal transaction
 * - `create` — convert a normal transaction into a transfer
 * - `change` — change the target account of an existing transfer
 */

export type TransferIntent =
  // no change to transfer state
  | { type: "none" }
  // transfer -> normal
  | { type: "remove" }
  // normal -> transfer
  | { type: "create"; targetAccountId: AccountId }
  // transfer A -> transfer B
  | { type: "change"; targetAccountId: AccountId };

/**
 * Resolves how the transfer state of a transaction should change based on
 * the current snapshot and an edit payload.
 *
 * This function is pure and does not perform any validation or I/O.
 * It determines whether the edit implies:
 *
 * - no change to transfer state
 * - removal of an existing transfer (transfer → normal)
 * - creation of a new transfer (normal → transfer)
 * - change of transfer target account (transfer A → transfer B)
 *
 * The resolution is based solely on the presence and value of
 * `payload.transferAccountId` relative to the current snapshot.
 *
 * @param snapshot - Immutable snapshot of the transaction before the edit
 * @param payload - Partial edit payload containing an optional transferAccountId
 *
 * @returns A `TransferIntent` describing the required transfer lifecycle change
 */

export const resolveTransferIntent = (
  snapshot: TransactionSnapshot,
  payload: EditTransactionCommand
): TransferIntent => {
  if (payload.transferAccountId === undefined) {
    return { type: "none" };
  }

  // Explicitly removing transfer
  if (payload.transferAccountId === null) {
    return snapshot.isTransfer ? { type: "remove" } : { type: "none" };
  }

  // payload.transferAccountId is a string
  if (!snapshot.isTransfer) {
    return { type: "create", targetAccountId: payload.transferAccountId };
  }

  // snapshot is already transfer
  if (snapshot.mainTx.transferAccountId === payload.transferAccountId) {
    return { type: "none" };
  }

  return { type: "change", targetAccountId: payload.transferAccountId };
};

/**
 * Builds an edit intent for a single transaction without performing any writes.
 *
 * This function derives:
 * - a Prisma `TransactionUpdateInput` describing how the main transaction should be updated
 * - a resolved transfer intent describing how (or if) transfer-related records should change
 *
 * It uses the provided transaction snapshot and edit payload to apply domain rules and
 * perform all necessary validations and lookups, including:
 *
 * - Validating ownership of referenced accounts, categories, and payees
 * - Resolving relational updates using Prisma `connect` / `disconnect`
 * - Enforcing transfer semantics (e.g. clearing category and payee for transfers)
 * - Handling explicit removal of transfers (transfer → normal)
 * - Ensuring inflow and outflow remain mutually exclusive
 * - Mapping `null` or missing category inputs to the uncategorised category where required
 *
 * No database mutations are performed here; the returned intent is meant to be applied
 * later as part of a transactional workflow.
 *
 * @param tx - Prisma transaction client used for all reads and validations
 * @param userId - ID of the user performing the edit (used for ownership checks)
 * @param snapshot - Immutable snapshot of the transaction prior to editing
 * @param payload - Partial edit payload describing the requested changes
 *
 * @returns An edit intent containing:
 * - `updateData`: a Prisma-compatible update object for the main transaction
 * - `transfer`: the resolved transfer intent describing transfer lifecycle changes
 *
 * @throws If referenced entities (account, category, payee) do not exist or are not owned
 * by the user. Specific error types are thrown by the underlying services.
 */

export async function buildEditIntent(
  tx: Prisma.TransactionClient,
  userId: UserId,
  snapshot: TransactionSnapshot,
  payload: EditTransactionCommand
): Promise<EditTransactionIntent> {
  const updateData: Prisma.TransactionUpdateInput = {};
  const transfer = resolveTransferIntent(snapshot, payload);

  // accountId
  if (payload.accountId !== undefined) {
    const account = await accountService.getAccount(
      tx,
      payload.accountId,
      userId
    );

    updateData.account = { connect: { id: account.id } };
  }

  const willBeTransfer =
    (snapshot.isTransfer && transfer.type !== "remove") ||
    transfer.type === "create" ||
    transfer.type === "change";

  const transferToNormal = transfer.type === "remove";

  // categoryId
  if (willBeTransfer) {
    updateData.category = { disconnect: true };
  } else if (payload.categoryId !== undefined || transferToNormal) {
    if (payload.categoryId === null) {
      const uncategorisedCategoryId =
        await categoryService.categories.getUncategorisedCategoryId(tx, userId);

      updateData.category = { connect: { id: uncategorisedCategoryId } };
    } else if (payload.categoryId === undefined) {
      const uncategorisedCategoryId =
        await categoryService.categories.getUncategorisedCategoryId(tx, userId);

      updateData.category = { connect: { id: uncategorisedCategoryId } };
    } else {
      const category = await categoryService.categories.getCategory(
        tx,
        userId,
        payload.categoryId
      );

      updateData.category = { connect: { id: category.id } };
    }
  }

  // payeeId or payeeName
  if (payload.payeeId !== undefined || payload.payeeName !== undefined) {
    if (payload.payeeId === null || willBeTransfer) {
      updateData.payee = { disconnect: true };
    } else {
      const payeeId = await payeeService.resolvePayeeId(
        tx,
        userId,
        payload.payeeId,
        payload.payeeName
      );
      updateData.payee = { connect: { id: payeeId } };
    }
  }

  // memo
  if (payload.memo !== undefined) updateData.memo = payload.memo;
  // date
  if (payload.date !== undefined) updateData.date = payload.date;
  // cleared
  if (payload.cleared !== undefined) updateData.cleared = payload.cleared;

  // inflow
  if (payload.inflow !== undefined) {
    updateData.inflow = payload.inflow;
    updateData.outflow = ZERO;
  }
  // outflow
  if (payload.outflow !== undefined) {
    updateData.outflow = payload.outflow;
    updateData.inflow = ZERO;
  }

  return { updateData, transfer };
}
