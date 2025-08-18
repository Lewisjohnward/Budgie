import { validateTransaction } from "./validation.domain";

describe("validateTransaction", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should not throw an error for a transaction with a past date", () => {
    jest.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));
    const transaction = { date: "2025-01-09T12:00:00.000Z" };
    expect(() => validateTransaction(transaction)).not.toThrow();
  });

  it("should not throw an error for a transaction with the current date", () => {
    jest.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));
    const transaction = { date: "2025-01-10T12:00:00.000Z" };
    expect(() => validateTransaction(transaction)).not.toThrow();
  });

  it("should throw an error for a transaction with a future date", () => {
    jest.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));
    const transaction = { date: "2025-01-11T12:00:00.000Z" };
    expect(() => validateTransaction(transaction)).toThrow(
      "transaction is in the future, rejected",
    );
  });

  it("should not throw an error when the transaction date is not provided", () => {
    jest.setSystemTime(new Date("2025-01-10T12:00:00.000Z"));
    const transaction = {};
    expect(() => validateTransaction(transaction)).not.toThrow();
  });
});
