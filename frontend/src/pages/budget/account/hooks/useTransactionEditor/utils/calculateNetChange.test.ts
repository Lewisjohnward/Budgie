import { describe, expect, it } from "vitest";
import { calculateNetChange } from "./calculateNetChange";

describe("calculateNetChange", () => {
  it("should return positive net change as inflow", () => {
    expect(calculateNetChange(100, 40)).toEqual({
      inflow: 60,
      outflow: undefined,
    });
  });

  it("should return negative net change as outflow", () => {
    expect(calculateNetChange(40, 100)).toEqual({
      inflow: undefined,
      outflow: 60,
    });
  });

  it("should return undefined for both when inflow and outflow are equal", () => {
    expect(calculateNetChange(100, 100)).toEqual({
      inflow: undefined,
      outflow: undefined,
    });
  });

  it("should handle zero inflow", () => {
    expect(calculateNetChange(0, 50)).toEqual({
      inflow: undefined,
      outflow: 50,
    });
  });

  it("should handle zero outflow", () => {
    expect(calculateNetChange(50, 0)).toEqual({
      inflow: 50,
      outflow: undefined,
    });
  });

  it("should handle decimal values accurately", () => {
    expect(calculateNetChange(10.3, 5.1)).toEqual({
      inflow: 5.2,
      outflow: undefined,
    });
  });

  it("should handle small decimal differences", () => {
    expect(calculateNetChange(0.3, 0.1)).toEqual({
      inflow: 0.2,
      outflow: undefined,
    });
  });
});
