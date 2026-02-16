import { HttpError } from "../../../shared/errors";

export class FutureDateError extends HttpError {
  constructor() {
    super("Transaction date cannot be in the future", 400);
  }
}

export class TransactionDateTooOldError extends HttpError {
  constructor(message?: string) {
    super(message ?? "Transaction date is too far in the past", 400);
  }
}

export class SameAccountTransferError extends HttpError {
  constructor() {
    super("Cannot transfer to the same account", 400);
  }
}

export class NoTransactionsFoundError extends HttpError {
  constructor() {
    super("No transactions found", 404);
  }
}

export class TransactionsNotFoundError extends HttpError {
  constructor() {
    super("One or more transactions were not found", 404);
  }
}

export class TransferPairMissingError extends HttpError {
  constructor() {
    super(
      "Invariant violation: transfer transaction has no paired transaction",
      409
    );
  }
}

export class TransactionInvariantError extends Error {
  constructor(
    message: string,
    readonly meta?: Record<string, unknown>
  ) {
    super(message);
    this.name = "TransactionInvariantError";
  }
}

export class MissingTransferPairIdError extends TransactionInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super("Invariant violated: transfer transaction missing pair id", meta);
    this.name = "MissingTransferPairIdError";
  }
}

export class TransferPairNotFoundError extends TransactionInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super("Invariant violated: transfer pair transaction not found", meta);
    this.name = "TransferPairNotFoundError";
  }
}

export class UpdatedNormalTransactionsNotFoundError extends TransactionInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super(
      "Invariant violated: expected all updated transactions to be normal transactions",
      meta
    );
    this.name = "UpdatedNormalTransactionsNotFoundError";
  }
}

export class TransferDestinationMissingPairIdError extends TransactionInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super(
      "Invariant violated: transfer destination transferTransactionId must be provided",
      meta
    );
    this.name = "TransferDestinationMissingPairIdError";
  }
}

export class PairedTransactionNotTransferError extends TransactionInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super("Invariant violated: paired transaction is not transfer", meta);
    this.name = "PairedTransactionNotTransferError";
  }
}

export class UpdatedTransferTransactionsMismatchError extends TransactionInvariantError {
  constructor(meta?: Record<string, unknown>) {
    super(
      "Invariant violated: mismatch between expected and updated transfer transaction ids",
      meta
    );
    this.name = "UpdatedTransferTransactionsMismatchError";
  }
}
