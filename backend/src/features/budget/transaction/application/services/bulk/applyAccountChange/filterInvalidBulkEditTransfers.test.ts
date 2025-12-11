import { filterInvalidBulkEditTransfers } from "./filterInvalidBulkEditTransfers";
import { TransferTransactionEntity } from "../../../../transaction.types";

describe("filterInvalidBulkEditTransfers", () => {
  const mkTransfer = (overrides: Partial<TransferTransactionEntity> = {}) =>
    ({
      id: "t1",
      transferTransactionId: "t2",
      transferAccountId: "acc-counterpart",
      ...(overrides as any),
    }) as TransferTransactionEntity;

  it("Should return original transactionIds when there are no selected transfer transactions", () => {
    const transactionIds = ["n1", "n2", "n3"];
    const result = filterInvalidBulkEditTransfers(transactionIds, [], "acc-x");

    expect(result).toEqual(transactionIds);
  });

  it("Should not exclude a selected transfer when only one side is selected and target account is not the counterpart", () => {
    const transactionIds = ["t1", "n1"];
    const selectedTransfers = [
      mkTransfer({
        id: "t1",
        transferTransactionId: "t2",
        transferAccountId: "acc-counterpart",
      }),
    ];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      "acc-target"
    );

    expect(result).toEqual(transactionIds);
  });

  it("Should exclude a transfer if the user selected both sides of the same transfer pair", () => {
    const transactionIds = ["t1", "t2", "n1"];
    const selectedTransfers = [
      mkTransfer({
        id: "t1",
        transferTransactionId: "t2",
        transferAccountId: "acc-counterpart",
      }),
    ];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      "acc-target"
    );

    expect(result).toEqual(["t2", "n1"]);
  });

  it("Should exclude a transfer if the target account is the transfer's counterpart account", () => {
    const transactionIds = ["t1", "n1"];
    const selectedTransfers = [
      mkTransfer({
        id: "t1",
        transferTransactionId: "t2",
        transferAccountId: "acc-target",
      }),
    ];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      "acc-target"
    );

    expect(result).toEqual(["n1"]);
  });

  it("Should excludes a transfer when either invariant is violated (both selected OR moving to counterpart)", () => {
    const transactionIds = ["t1", "t2", "t3", "n1"];

    const selectedTransfers: TransferTransactionEntity[] = [
      mkTransfer({
        id: "t1",
        transferTransactionId: "t2",
        transferAccountId: "acc-a",
      }),
      mkTransfer({
        id: "t3",
        transferTransactionId: "t4",
        transferAccountId: "acc-target",
      }),
    ];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      "acc-target"
    );
    expect(result).toEqual(["t2", "n1"]);
  });

  it("Should only excludes ids that are actually present in transactionIds (ignores selectedTransfers not in the selection)", () => {
    const transactionIds = ["n1", "t1"];

    const selectedTransfers = [
      mkTransfer({
        id: "t999",
        transferTransactionId: "t1000",
        transferAccountId: "acc-target",
      }),
      mkTransfer({
        id: "t1",
        transferTransactionId: "t2",
        transferAccountId: "acc-a",
      }),
    ];

    const result = filterInvalidBulkEditTransfers(
      transactionIds,
      selectedTransfers,
      "acc-target"
    );

    expect(result).toEqual(["n1", "t1"]);
  });

  it("Should not not mutate the input transactionIds array", () => {
    const transactionIds = ["t1", "t2", "n1"];
    const original = [...transactionIds];

    const selectedTransfers = [
      mkTransfer({
        id: "t1",
        transferTransactionId: "t2",
        transferAccountId: "acc-a",
      }),
    ];

    filterInvalidBulkEditTransfers(transactionIds, selectedTransfers, "acc-x");

    expect(transactionIds).toEqual(original);
  });
});
