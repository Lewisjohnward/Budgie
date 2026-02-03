import { Decimal } from "@prisma/client/runtime/library";
import { type DomainNormalTransaction } from "../../transaction/transaction.types";
import { roundTransactionsToStartOfMonth } from "./roundTransactionsToStartOfMonth";

const makeTx = (date: string): DomainNormalTransaction => ({
  type: "normal",
  id: "tx-1" as DomainNormalTransaction["id"],
  accountId: "acc-1" as DomainNormalTransaction["accountId"],
  categoryId: "cat-1" as DomainNormalTransaction["categoryId"],
  date: new Date(date),
  memo: "",
  inflow: new Decimal(0),
  outflow: new Decimal(50),
});

describe("roundTransactionsToStartOfMonth", () => {
  it("should round a mid-month date to the first of that month", () => {
    const result = roundTransactionsToStartOfMonth([
      makeTx("2025-06-15T14:30:00.000Z"),
    ]);

    expect(result[0].date.toISOString()).toBe("2025-06-01T00:00:00.000Z");
  });

  it("should leave a date already at start of month unchanged", () => {
    const result = roundTransactionsToStartOfMonth([
      makeTx("2025-06-01T00:00:00.000Z"),
    ]);

    expect(result[0].date.toISOString()).toBe("2025-06-01T00:00:00.000Z");
  });

  it("should round the last moment of a month to the first of that month", () => {
    const result = roundTransactionsToStartOfMonth([
      makeTx("2025-01-31T23:59:59.999Z"),
    ]);

    expect(result[0].date.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });

  it("should handle multiple transactions across different months", () => {
    const result = roundTransactionsToStartOfMonth([
      makeTx("2025-03-10T08:00:00.000Z"),
      makeTx("2025-07-22T16:45:00.000Z"),
      makeTx("2025-12-31T23:59:59.999Z"),
    ]);

    expect(result[0].date.toISOString()).toBe("2025-03-01T00:00:00.000Z");
    expect(result[1].date.toISOString()).toBe("2025-07-01T00:00:00.000Z");
    expect(result[2].date.toISOString()).toBe("2025-12-01T00:00:00.000Z");
  });

  it("should return an empty array when given an empty array", () => {
    const result = roundTransactionsToStartOfMonth([]);

    expect(result).toEqual([]);
  });

  it("should not mutate the original transactions", () => {
    const original = makeTx("2025-06-15T14:30:00.000Z");
    const originalDate = original.date;

    roundTransactionsToStartOfMonth([original]);

    expect(original.date).toBe(originalDate);
  });

  it("should preserve all non-date fields", () => {
    const tx = makeTx("2025-06-15T14:30:00.000Z");
    const result = roundTransactionsToStartOfMonth([tx]);

    expect(result[0].type).toBe(tx.type);
    expect(result[0].id).toBe(tx.id);
    expect(result[0].accountId).toBe(tx.accountId);
    expect(result[0].categoryId).toBe(tx.categoryId);
    expect(result[0].memo).toBe(tx.memo);
    expect(result[0].inflow).toEqual(tx.inflow);
    expect(result[0].outflow).toEqual(tx.outflow);
  });
});
