import { isValidISODate } from "./TransactionUtility";

describe("TransactionUtility", () => {
  it("Should return true when given a correct isoString", () => {
    const isValid = isValidISODate("2024-12-18T14:37:56.000Z");
    expect(isValid).toEqual(true);
  });

  it("Should return false when given an incorrect isoString", () => {
    const isValid = isValidISODate("invalid-string");
    expect(isValid).toEqual(false);
  });
});
