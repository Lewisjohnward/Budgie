import { getMonthRange } from "./getMonthRange";

describe("getMonthRange", () => {
  const startDate = new Date("2025-01-15T12:00:00.000Z");
  const endDate = new Date("2025-04-10T12:00:00.000Z");

  it("should return the correct months with default options (start exclusive, end inclusive)", () => {
    const result = getMonthRange(startDate, endDate);
    expect(result).toEqual([
      new Date(Date.UTC(2025, 1, 1)), // Feb
      new Date(Date.UTC(2025, 2, 1)), // Mar
      new Date(Date.UTC(2025, 3, 1)), // Apr
    ]);
  });

  it("should return the correct months when fully inclusive", () => {
    const result = getMonthRange(startDate, endDate, {
      startInclusive: true,
      endInclusive: true,
    });
    expect(result).toEqual([
      new Date(Date.UTC(2025, 0, 1)), // Jan
      new Date(Date.UTC(2025, 1, 1)), // Feb
      new Date(Date.UTC(2025, 2, 1)), // Mar
      new Date(Date.UTC(2025, 3, 1)), // Apr
    ]);
  });

  it("should return the correct months when fully exclusive", () => {
    const result = getMonthRange(startDate, endDate, {
      startInclusive: false,
      endInclusive: false,
    });
    expect(result).toEqual([
      new Date(Date.UTC(2025, 1, 1)), // Feb
      new Date(Date.UTC(2025, 2, 1)), // Mar
    ]);
  });

  it("should return the correct months when start inclusive and end exclusive", () => {
    const result = getMonthRange(startDate, endDate, {
      startInclusive: true,
      endInclusive: false,
    });
    expect(result).toEqual([
      new Date(Date.UTC(2025, 0, 1)), // Jan
      new Date(Date.UTC(2025, 1, 1)), // Feb
      new Date(Date.UTC(2025, 2, 1)), // Mar
    ]);
  });

  it("should handle ranges that span across years", () => {
    const start = new Date("2024-11-10T12:00:00.000Z");
    const end = new Date("2025-02-10T12:00:00.000Z");
    const result = getMonthRange(start, end, { startInclusive: true, endInclusive: true });
    expect(result).toEqual([
      new Date(Date.UTC(2024, 10, 1)), // Nov
      new Date(Date.UTC(2024, 11, 1)), // Dec
      new Date(Date.UTC(2025, 0, 1)),  // Jan
      new Date(Date.UTC(2025, 1, 1)),  // Feb
    ]);
  });

  it("should return an empty array for a range within the same month (exclusive)", () => {
    const start = new Date("2025-03-05T12:00:00.000Z");
    const end = new Date("2025-03-25T12:00:00.000Z");
    const result = getMonthRange(start, end, { endInclusive: false });
    expect(result).toEqual([]);
  });

  it("should return the single month for a range within the same month (inclusive)", () => {
    const start = new Date("2025-03-05T12:00:00.000Z");
    const end = new Date("2025-03-25T12:00:00.000Z");
    const result = getMonthRange(start, end, { startInclusive: true, endInclusive: true });
    expect(result).toEqual([new Date(Date.UTC(2025, 2, 1))]);
  });
});
