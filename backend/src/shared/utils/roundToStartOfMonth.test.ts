import { roundToStartOfMonth } from "./roundToStartOfMonth";

describe("roundToStartOfMonth", () => {
  it("should round date to start of month at midnight UTC", () => {
    const inputDate = new Date("2025-03-15T14:30:45.123Z");
    const result = roundToStartOfMonth(inputDate);

    expect(result.toISOString()).toBe("2025-03-01T00:00:00.000Z");
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
    expect(result.getUTCMilliseconds()).toBe(0);
  });

  it("should handle first day of month correctly", () => {
    const inputDate = new Date("2025-03-01T23:59:59.999Z");
    const result = roundToStartOfMonth(inputDate);

    expect(result.toISOString()).toBe("2025-03-01T00:00:00.000Z");
  });

  it("should handle last day of month correctly", () => {
    const inputDate = new Date("2025-03-31T23:59:59.999Z");
    const result = roundToStartOfMonth(inputDate);

    expect(result.toISOString()).toBe("2025-03-01T00:00:00.000Z");
  });

  it("should handle year boundary correctly", () => {
    const inputDate = new Date("2025-01-15T12:00:00.000Z");
    const result = roundToStartOfMonth(inputDate);

    expect(result.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });

  it("should handle leap year February correctly", () => {
    // 2024 is a leap year
    const inputDate = new Date("2024-02-29T12:00:00.000Z");
    const result = roundToStartOfMonth(inputDate);

    expect(result.toISOString()).toBe("2024-02-01T00:00:00.000Z");
  });

  it("should handle non-leap year February correctly", () => {
    // 2023 is not a leap year
    const inputDate = new Date("2023-02-28T12:00:00.000Z");
    const result = roundToStartOfMonth(inputDate);

    expect(result.toISOString()).toBe("2023-02-01T00:00:00.000Z");
  });

  it.each([
    {
      input: "2025-03-31T23:59:59.999Z",
      expected: "2025-03-01T00:00:00.000Z",
    },
    {
      input: "2025-04-01T00:00:00.000Z",
      expected: "2025-04-01T00:00:00.000Z",
    },
    {
      input: "2025-12-31T23:59:59.999Z",
      expected: "2025-12-01T00:00:00.000Z",
    },
    {
      input: "2026-01-01T00:00:00.000Z",
      expected: "2026-01-01T00:00:00.000Z",
    },
  ])(
    "returns the start of the correct month for $input",
    ({ input, expected }) => {
      expect(roundToStartOfMonth(new Date(input)).toISOString()).toBe(expected);
    }
  );

  it("should handle timezone-aware input consistently", () => {
    const utcDate = new Date("2025-03-15T12:00:00.000Z");
    const localDate = new Date("2025-03-15T12:00:00");

    const utcResult = roundToStartOfMonth(utcDate);
    const localResult = roundToStartOfMonth(localDate);

    expect(utcResult.toISOString()).toBe("2025-03-01T00:00:00.000Z");
    expect(localResult.toISOString()).toMatch(/2025-0[23]-01T00:00:00\.000Z/);
  });

  it("should return a new Date object (not mutate input)", () => {
    const inputDate = new Date("2025-03-15T12:00:00.000Z");
    const originalTime = inputDate.getTime();

    const result = roundToStartOfMonth(inputDate);

    expect(inputDate.getTime()).toBe(originalTime);
    expect(result).not.toBe(inputDate);
    expect(result.getTime()).not.toBe(originalTime);
  });
});
