import { describe, expect, it } from "vitest";
import { addMoney, subtractMoney } from "./money";

describe("money", () => {
  describe("addMoney", () => {
    it("adds two values without floating-point precision issues", () => {
      expect(addMoney(0.1, 0.2)).toBe(0.3);
    });

    it("adds multiple values", () => {
      expect(addMoney(10.25, 5.5, 2.25)).toBe(18);
    });

    it("accepts string values", () => {
      expect(addMoney("10.25", "5.75")).toBe(16);
    });

    it("handles negative values", () => {
      expect(addMoney(10, -3)).toBe(7);
    });

    it("returns zero when no values are provided", () => {
      expect(addMoney()).toBe(0);
    });

    it("handles zero values", () => {
      expect(addMoney(10, 0)).toBe(10);
    });
  });

  describe("subtractMoney", () => {
    it("subtracts values without floating-point precision issues", () => {
      expect(subtractMoney(0.3, 0.1)).toBe(0.2);
    });

    it("handles negative results", () => {
      expect(subtractMoney(5, 10)).toBe(-5);
    });

    it("accepts string values", () => {
      expect(subtractMoney("10.50", "0.25")).toBe(10.25);
    });

    it("handles zero values", () => {
      expect(subtractMoney(10, 0)).toBe(10);
    });

    it("handles negative inputs", () => {
      expect(subtractMoney(10, -5)).toBe(15);
    });
  });
});
