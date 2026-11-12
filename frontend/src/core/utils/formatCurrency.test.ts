import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  describe("default formatting", () => {
    it("formats a positive number", () => {
      expect(formatCurrency(123.45)).toBe("£123.45");
    });

    it("formats a negative number", () => {
      expect(formatCurrency(-123.45)).toBe("-£123.45");
    });

    it("formats zero", () => {
      expect(formatCurrency(0)).toBe("£0.00");
    });

    it("formats whole numbers with two decimal places", () => {
      expect(formatCurrency(100)).toBe("£100.00");
    });

    it("formats numbers with thousands separators", () => {
      expect(formatCurrency(1234567.89)).toBe("£1,234,567.89");
    });
  });

  describe("showPlus", () => {
    it("adds a plus sign to positive values when enabled", () => {
      expect(formatCurrency(123.45, { showPlus: true })).toBe("+£123.45");
    });

    it("does not add a plus sign when disabled", () => {
      expect(formatCurrency(123.45, { showPlus: false })).toBe("£123.45");
    });

    it("does not add a plus sign to zero", () => {
      expect(formatCurrency(0, { showPlus: true })).toBe("£0.00");
    });

    it("keeps the negative sign when showPlus is enabled", () => {
      expect(formatCurrency(-123.45, { showPlus: true })).toBe("-£123.45");
    });
  });

  describe("showNegative", () => {
    it("shows the negative sign by default", () => {
      expect(formatCurrency(-123.45)).toBe("-£123.45");
    });

    it("hides the negative sign when disabled", () => {
      expect(formatCurrency(-123.45, { showNegative: false })).toBe("£123.45");
    });

    it("does not affect positive values", () => {
      expect(formatCurrency(123.45, { showNegative: false })).toBe("£123.45");
    });
  });

  describe("includeSpace", () => {
    it("does not include a space by default", () => {
      expect(formatCurrency(123.45)).toBe("£123.45");
    });

    it("includes a space after the currency symbol when enabled", () => {
      expect(formatCurrency(123.45, { includeSpace: true })).toBe("£ 123.45");
    });

    it("preserves the space for negative values", () => {
      expect(formatCurrency(-123.45, { includeSpace: true })).toBe("-£ 123.45");
    });

    it("preserves the space when showing a plus sign", () => {
      expect(
        formatCurrency(123.45, {
          showPlus: true,
          includeSpace: true,
        })
      ).toBe("+£ 123.45");
    });
  });

  describe("locale", () => {
    it("uses en-GB formatting by default", () => {
      expect(formatCurrency(1234.56)).toBe("£1,234.56");
    });

    it("supports alternative locales", () => {
      expect(formatCurrency(1234.56, { locale: "de-DE" })).toBe("£1.234,56");
    });
  });

  describe("rounding", () => {
    it("rounds to two decimal places", () => {
      expect(formatCurrency(123.456)).toBe("£123.46");
    });

    it("rounds down to two decimal places", () => {
      expect(formatCurrency(123.454)).toBe("£123.45");
    });

    it("handles values smaller than one", () => {
      expect(formatCurrency(0.5)).toBe("£0.50");
    });
  });
});
