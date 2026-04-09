import { getMonth } from "./getMonth";

describe("getMonth", () => {
  beforeEach(() => {
    jest.useFakeTimers({
      doNotFake: ["nextTick", "setImmediate", "setTimeout", "setInterval"],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return current month and next month at midnight UTC", () => {
    // Set system time to middle of May 2025
    jest.setSystemTime(new Date("2025-05-15T14:30:00.000Z"));

    const { startOfCurrentMonth, nextMonth } = getMonth();

    // Both dates should be at midnight UTC
    expect(startOfCurrentMonth.toISOString()).toBe("2025-05-01T00:00:00.000Z");
    expect(nextMonth.toISOString()).toBe("2025-06-01T00:00:00.000Z");
  });

  it("should handle year boundary correctly", () => {
    // Set system time to December 2025
    jest.setSystemTime(new Date("2025-12-15T10:00:00.000Z"));

    const { startOfCurrentMonth, nextMonth } = getMonth();

    expect(startOfCurrentMonth.toISOString()).toBe("2025-12-01T00:00:00.000Z");
    expect(nextMonth.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("should handle daylight saving time transitions", () => {
    // Test during DST transition (March 31, 2025 in UK)
    jest.setSystemTime(new Date("2025-03-31T12:00:00.000Z"));

    const { startOfCurrentMonth, nextMonth } = getMonth();

    // Should still be at midnight UTC regardless of DST
    expect(startOfCurrentMonth.toISOString()).toBe("2025-03-01T00:00:00.000Z");
    expect(nextMonth.toISOString()).toBe("2025-04-01T00:00:00.000Z");
  });

  it("should handle leap year February correctly", () => {
    // Test February in a leap year
    jest.setSystemTime(new Date("2024-02-15T08:00:00.000Z"));

    const { startOfCurrentMonth, nextMonth } = getMonth();

    expect(startOfCurrentMonth.toISOString()).toBe("2024-02-01T00:00:00.000Z");
    expect(nextMonth.toISOString()).toBe("2024-03-01T00:00:00.000Z");
  });

  it("should handle end of month edge cases", () => {
    // Test on the last day of January (31st)
    jest.setSystemTime(new Date("2025-01-31T23:59:59.999Z"));

    const { startOfCurrentMonth, nextMonth } = getMonth();

    expect(startOfCurrentMonth.toISOString()).toBe("2025-01-01T00:00:00.000Z");
    expect(nextMonth.toISOString()).toBe("2025-02-01T00:00:00.000Z");
  });

  it("should return dates with consistent time (both at midnight)", () => {
    jest.setSystemTime(new Date("2025-07-15T16:45:30.123Z"));

    const { startOfCurrentMonth, nextMonth } = getMonth();

    // Both should have the same time component (midnight UTC)
    expect(startOfCurrentMonth.getUTCHours()).toBe(0);
    expect(startOfCurrentMonth.getUTCMinutes()).toBe(0);
    expect(startOfCurrentMonth.getUTCSeconds()).toBe(0);
    expect(startOfCurrentMonth.getUTCMilliseconds()).toBe(0);

    expect(nextMonth.getUTCHours()).toBe(0);
    expect(nextMonth.getUTCMinutes()).toBe(0);
    expect(nextMonth.getUTCSeconds()).toBe(0);
    expect(nextMonth.getUTCMilliseconds()).toBe(0);
  });

  it("should work correctly at month boundaries", () => {
    // Test at the very start of a month
    jest.setSystemTime(new Date("2025-06-01T00:00:00.000Z"));

    const { startOfCurrentMonth, nextMonth } = getMonth();

    expect(startOfCurrentMonth.toISOString()).toBe("2025-06-01T00:00:00.000Z");
    expect(nextMonth.toISOString()).toBe("2025-07-01T00:00:00.000Z");
  });
});
