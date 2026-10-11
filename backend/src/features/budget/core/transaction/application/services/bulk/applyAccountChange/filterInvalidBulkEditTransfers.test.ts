import { asAccountId } from "../../../../../account/account.types";
import {
  asTransactionId,
  DomainTransferTransaction,
} from "../../../../transaction.types";
import { filterInvalidBulkEditTransfers } from "./filterInvalidBulkEditTransfers";

describe("filterInvalidBulkEditTransfers", () => {
  const mkTransfer = (
    overrides: Partial<DomainTransferTransaction> = {}
  ): DomainTransferTransaction =>
    ({
      id: asTransactionId("t1"),
      transferTransactionId: asTransactionId("t2"),
      transferAccountId: asAccountId("acc-counterpart"),
      ...overrides,
    }) as DomainTransferTransaction;

  it("returns the original transaction IDs when no transfer transactions are selected", () => {
    const transactionIds = [
      asTransactionId("n1"),
      asTransactionId("n2"),
      asTransactionId("n3"),
    ];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      [],
      asAccountId("acc-x")
    );

    expect(result).toEqual(transactionIds);
  });

  it("does not exclude a selected transfer when only one side is selected and the target account is not the counterpart", () => {
    const transactionIds = [asTransactionId("t1"), asTransactionId("n1")];

    const selectedTransfers = [mkTransfer()];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      asAccountId("acc-target")
    );

    expect(result).toEqual(transactionIds);
  });

  it("excludes a transfer when both sides of the same transfer pair are selected", () => {
    const transactionIds = [
      asTransactionId("t1"),
      asTransactionId("t2"),
      asTransactionId("n1"),
    ];

    const selectedTransfers = [mkTransfer()];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      asAccountId("acc-target")
    );

    expect(result).toEqual([asTransactionId("t2"), asTransactionId("n1")]);
  });

  it("excludes a transfer when the target account is its counterpart account", () => {
    const transactionIds = [asTransactionId("t1"), asTransactionId("n1")];

    const selectedTransfers = [mkTransfer()];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      asAccountId("acc-counterpart")
    );

    expect(result).toEqual([asTransactionId("n1")]);
  });

  it("excludes transfers when either invariant is violated", () => {
    const transactionIds = [
      asTransactionId("t1"),
      asTransactionId("t2"),
      asTransactionId("t3"),
      asTransactionId("n1"),
    ];

    const selectedTransfers: DomainTransferTransaction[] = [
      mkTransfer({
        id: asTransactionId("t1"),
        transferTransactionId: asTransactionId("t2"),
        transferAccountId: asAccountId("acc-a"),
      }),
      mkTransfer({
        id: asTransactionId("t3"),
        transferTransactionId: asTransactionId("t4"),
        transferAccountId: asAccountId("acc-target"),
      }),
    ];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      asAccountId("acc-target")
    );

    expect(result).toEqual([asTransactionId("t2"), asTransactionId("n1")]);
  });

  it("does not exclude IDs for selected transfers that are not invalid", () => {
    const transactionIds = [asTransactionId("n1"), asTransactionId("t1")];

    const selectedTransfers = [
      mkTransfer({
        id: asTransactionId("t999"),
        transferTransactionId: asTransactionId("t1000"),
        transferAccountId: asAccountId("acc-target"),
      }),
      mkTransfer({
        id: asTransactionId("t1"),
        transferTransactionId: asTransactionId("t2"),
        transferAccountId: asAccountId("acc-a"),
      }),
    ];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      asAccountId("acc-target")
    );

    expect(result).toEqual(transactionIds);
  });

  it("does not mutate the input transaction IDs array", () => {
    const transactionIds = [
      asTransactionId("t1"),
      asTransactionId("t2"),
      asTransactionId("n1"),
    ];

    const original = [...transactionIds];

    const selectedTransfers = [
      mkTransfer({
        id: asTransactionId("t1"),
        transferTransactionId: asTransactionId("t2"),
        transferAccountId: asAccountId("acc-a"),
      }),
    ];

    filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      asAccountId("acc-x")
    );

    expect(transactionIds).toEqual(original);
  });
});
