import { getStartOfMonth } from "./getStartOfMonth";

describe("getStartOfUtcMonth", () => {
  it("returns the first day of the month at midnight UTC", () => {
    const date = new Date("2025-10-17T14:35:42.000Z");

    expect(getStartOfMonth(date)).toEqual(new Date("2025-10-01T00:00:00.000Z"));
  });
});
