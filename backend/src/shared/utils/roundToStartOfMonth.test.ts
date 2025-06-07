import { getIntermediateMonths } from "..";

describe("date", () => {
  describe("getIntermediateMonths", () => {
    it("Handles transition between March and April correctly", () => {
      const endDate = new Date("2025-04-15T13:46:00");
      const startDate = new Date("2025-03-15T13:46:00");

      const intermediateMonths = getIntermediateMonths(startDate, endDate);

      expect(intermediateMonths).toEqual([new Date("2025-03-01T00:00:00")]);
    });
    it("Handle missing dates over a year", () => {
      const endDate = new Date("2025-04-15T13:46:00");
      const startDate = new Date("2024-02-15T13:46:00");

      const intermediateMonths = getIntermediateMonths(startDate, endDate);

      expect(intermediateMonths).toEqual([
        new Date("2024-02-01T00:00:00Z"),
        new Date("2024-03-01T00:00:00Z"),
        new Date("2024-04-01T00:00:00Z"),
        new Date("2024-05-01T00:00:00Z"),
        new Date("2024-06-01T00:00:00Z"),
        new Date("2024-07-01T00:00:00Z"),
        new Date("2024-08-01T00:00:00Z"),
        new Date("2024-09-01T00:00:00Z"),
        new Date("2024-10-01T00:00:00Z"),
        new Date("2024-11-01T00:00:00Z"),
        new Date("2024-12-01T00:00:00Z"),
        new Date("2025-01-01T00:00:00Z"),
        new Date("2025-02-01T00:00:00Z"),
        new Date("2025-03-01T00:00:00Z"),
      ]);
    });
    it("Handle when the start and end date are the same month", () => {
      const startDate = new Date("2025-03-15T13:46:00");
      const endDate = new Date("2025-03-25T13:46:00");

      const intermediateMonths = getIntermediateMonths(startDate, endDate);

      expect(intermediateMonths).toEqual([]);
    });
  });
});
