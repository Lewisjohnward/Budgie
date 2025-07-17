import { describe, it, expect } from "vitest";
import { calculateBarColors } from "./calculateBarColors";

describe("calculateBarColors", () => {
  it("should be 0 on all colors when 0 assigned, 0 activity, 0 available", () => {
    const result = calculateBarColors({
      activity: 0,
      available: 0,
    });
    expect(result).toEqual({ green: 0, lightGreen: 0, red: 0 });
  });
  it("should be 0 on all colors when activity === available", () => {
    const result = calculateBarColors({
      activity: 5,
      available: 5,
    });
    expect(result).toEqual({ green: 0, lightGreen: 0, red: 0 });
  });

  it("should be 100 green when activity > 0 and available is greater than activity", () => {
    const result = calculateBarColors({
      activity: 5,
      available: 8,
    });
    expect(result).toEqual({ green: 100, lightGreen: 0, red: 0 });
  });

  it("should return all colors 0 when activity positive and > available", () => {
    const result = calculateBarColors({
      activity: 10,
      available: 5,
    });
    expect(result).toEqual({ green: 0, lightGreen: 0, red: 0 });
  });

  it("should return 100% green when available > 0 and activity is 0", () => {
    const result = calculateBarColors({
      activity: 0,
      available: 10,
    });
    expect(result).toEqual({ green: 100, lightGreen: 0, red: 0 });
  });

  it("should return 50% lightGreen 50% green when available and activity negate", () => {
    const result = calculateBarColors({
      activity: -5,
      available: 5,
    });
    expect(result).toEqual({ green: 50, lightGreen: 50, red: 0 });
  });

  it("should return 100% lightGreen when activity is non zero and available is zero", () => {
    const result = calculateBarColors({
      activity: -5,
      available: 0,
    });
    expect(result).toEqual({ green: 0, lightGreen: 100, red: 0 });
  });

  it("should split green and lightGreen proportionally when available > 0 and activity > 0", () => {
    const result = calculateBarColors({
      activity: -2.5,
      available: 7.5,
    });
    expect(result).toEqual({ green: 75, lightGreen: 25, red: 0 });
  });
  it("should return 100% red when available is negative and available === activity", () => {
    const result = calculateBarColors({
      activity: -10,
      available: -10,
    });
    expect(result).toEqual({ green: 0, lightGreen: 0, red: 100 });
  });

  it("should return 50% red 50% lightgreen when available is half activity", () => {
    const result = calculateBarColors({
      activity: -10,
      available: -5,
    });
    expect(result).toEqual({ green: 0, lightGreen: 50, red: 50 });
  });

  it("should return 66% red 33% lightgreen when available is half activity", () => {
    const result = calculateBarColors({
      activity: -10,
      available: -7.5,
    });
    expect(result).toEqual({ green: 0, lightGreen: 25, red: 75 });
  });
  it("should return all colors 0 when available is negative and no activity", () => {
    const result = calculateBarColors({
      activity: 0,
      available: -5,
    });
    expect(result).toEqual({ green: 0, lightGreen: 0, red: 0 });
  });
});
