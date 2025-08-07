import { calculateAverageSpent } from "./calculateAverageSpent";

// Helper function to maintain the same interface as the old calculateAverageSpend
const calculateAverageSpend = (
  months: any[],
  currentMonthIndex: number,
  _selectedCategoryIds?: any
): string => {
  const { totalAverageSpend } = calculateAverageSpent(
    months,
    currentMonthIndex
  );
  return totalAverageSpend.toFixed(2);
};

describe("calculateAverageSpend", () => {
  describe("handles a single category", () => {
    const mockMonths = [
      { month: "2022-01-01", activity: 10, categoryId: "1" },
      { month: "2022-02-01", activity: 0, categoryId: "1" },
      { month: "2022-03-01", activity: 0, categoryId: "1" },
      { month: "2022-04-01", activity: 0, categoryId: "1" },
      { month: "2022-05-01", activity: 0, categoryId: "1" },
      { month: "2022-06-01", activity: 0, categoryId: "1" },
      { month: "2022-07-01", activity: 0, categoryId: "1" },
      { month: "2022-08-01", activity: 0, categoryId: "1" },
      { month: "2022-09-01", activity: 0, categoryId: "1" },
      { month: "2022-10-01", activity: 0, categoryId: "1" },
      { month: "2022-11-01", activity: 0, categoryId: "1" },
      { month: "2022-12-01", activity: 0, categoryId: "1" },
      { month: "2023-01-01", activity: 0, categoryId: "1" },
    ];

    const selectedCategoryIds = new Set(["1"]);

    const testCases = [
      {
        monthIndex: 0,
        expected: "0.00",
        description: "returns 0.00 for month 0 (no previous months)",
      },
      {
        monthIndex: 1,
        expected: "10.00",
        description: "calculates average for month 1 (1 previous month)",
      },
      {
        monthIndex: 2,
        expected: "5.00",
        description: "calculates average for month 2 (2 previous months)",
      },
      {
        monthIndex: 3,
        expected: "3.34",
        description: "calculates average for month 3 (3 previous months)",
      },
      {
        monthIndex: 4,
        expected: "2.50",
        description: "calculates average for month 4 (4 previous months)",
      },
      {
        monthIndex: 5,
        expected: "2.00",
        description: "calculates average for month 5 (5 previous months)",
      },
      {
        monthIndex: 12,
        expected: "0.84",
        description: "calculates average for month 12 (12 previous months)",
      },
      {
        monthIndex: 13,
        expected: "0.00",
        description: "returns 0.00 for month 13 (13 previous months)",
      },
    ];

    testCases.forEach(({ monthIndex, expected, description }) => {
      it(description, () => {
        const result = calculateAverageSpend(
          mockMonths,
          monthIndex,
          selectedCategoryIds
        );
        expect(result).toBe(expected);
      });
    });
    it("handles empty months array", () => {
      const result = calculateAverageSpend([], 0, selectedCategoryIds);
      expect(result).toBe("0.00");
    });

    it("handles months without selected categories", () => {
      const result = calculateAverageSpend(mockMonths, 5);
      expect(result).toBe("2.00");
    });
  });

  describe("handles single category with spent in different months", () => {
    const mockMonths = [
      { month: "2022-01-01", activity: 10, categoryId: "1" },
      { month: "2022-02-01", activity: 0, categoryId: "1" },
      { month: "2022-03-01", activity: 10, categoryId: "1" },
      { month: "2022-04-01", activity: 0, categoryId: "1" },
      { month: "2022-05-01", activity: 0, categoryId: "1" },
      { month: "2022-06-01", activity: 0, categoryId: "1" },
      { month: "2022-07-01", activity: 0, categoryId: "1" },
      { month: "2022-08-01", activity: 0, categoryId: "1" },
      { month: "2022-09-01", activity: 0, categoryId: "1" },
      { month: "2022-10-01", activity: 0, categoryId: "1" },
      { month: "2022-11-01", activity: 0, categoryId: "1" },
      { month: "2022-12-01", activity: 0, categoryId: "1" },
      { month: "2023-01-01", activity: 0, categoryId: "1" },
      { month: "2023-02-01", activity: 0, categoryId: "1" },
      { month: "2023-03-01", activity: 0, categoryId: "1" },
      { month: "2023-04-01", activity: 0, categoryId: "1" },
    ];

    const testCases = [
      {
        monthIndex: 0,
        expected: "0.00",
        description: "returns 0.00 for month 0 (no previous months)",
      },
      {
        monthIndex: 1,
        expected: "10.00",
        description: "calculates average for month 1 (1 previous month)",
      },
      {
        monthIndex: 2,
        expected: "5.00",
        description: "calculates average for month 2 (2 previous months)",
      },
      {
        monthIndex: 3,
        expected: "6.67",
        description: "calculates average for month 3 (3 previous months)",
      },
      {
        monthIndex: 4,
        expected: "5.00",
        description: "calculates average for month 4 (4 previous months)",
      },
      {
        monthIndex: 5,
        expected: "4.00",
        description: "calculates average for month 5 (5 previous months)",
      },
      {
        monthIndex: 12,
        expected: "1.67",
        description: "calculates average for month 12 (12 previous months)",
      },
      {
        monthIndex: 13,
        expected: "0.91",
        description: "returns 0.00 for month 13 (13 previous months)",
      },
      {
        monthIndex: 14,
        expected: "0.84",
        description: "returns 0.83 for month 14 (14 previous months)",
      },
      {
        monthIndex: 15,
        expected: "0.00",
        description: "returns 0.00 for month 15 (15 previous months)",
      },
    ];

    testCases.forEach(({ monthIndex, expected, description }) => {
      it(description, () => {
        const result = calculateAverageSpend(mockMonths, monthIndex);
        expect(result).toBe(expected);
      });
    });
  });
  describe("handles single category with spend not at index 0", () => {
    const mockMonths = [
      { month: "2022-01-01", activity: 0, categoryId: "1" },
      { month: "2022-02-01", activity: 0, categoryId: "1" },
      { month: "2022-03-01", activity: 5.33, categoryId: "1" },
      { month: "2022-04-01", activity: 0, categoryId: "1" },
      { month: "2022-05-01", activity: 0, categoryId: "1" },
      { month: "2022-06-01", activity: 0, categoryId: "1" },
      { month: "2022-07-01", activity: 0, categoryId: "1" },
      { month: "2022-08-01", activity: 0, categoryId: "1" },
      { month: "2022-09-01", activity: 0, categoryId: "1" },
      { month: "2022-10-01", activity: 0, categoryId: "1" },
      { month: "2022-11-01", activity: 0, categoryId: "1" },
      { month: "2022-12-01", activity: 0, categoryId: "1" },
      { month: "2023-01-01", activity: 0, categoryId: "1" },
      { month: "2023-02-01", activity: 0, categoryId: "1" },
      { month: "2023-03-01", activity: 0, categoryId: "1" },
      { month: "2023-04-01", activity: 0, categoryId: "1" },
    ];

    const testCases = [
      {
        monthIndex: 0,
        expected: "0.00",
        description: "returns 0.00 for month 0 (no previous months)",
      },
      {
        monthIndex: 1,
        expected: "0.00",
        description: "calculates average for month 1 (1 previous month)",
      },
      {
        monthIndex: 2,
        expected: "0.00",
        description: "calculates average for month 2 (2 previous months)",
      },
      {
        monthIndex: 3,
        expected: "5.33",
        description: "calculates average for month 3 (3 previous months)",
      },
      {
        monthIndex: 4,
        expected: "2.67",
        description: "calculates average for month 4 (4 previous months)",
      },
      {
        monthIndex: 5,
        expected: "1.78",
        description: "calculates average for month 5 (5 previous months)",
      },
      {
        monthIndex: 12,
        expected: "0.54",
        description: "calculates average for month 12 (12 previous months)",
      },
      {
        monthIndex: 13,
        expected: "0.49",
        description: "returns 0.00 for month 13 (13 previous months)",
      },
      {
        monthIndex: 14,
        expected: "0.45",
        description: "returns 0.83 for month 14 (14 previous months)",
      },
      {
        monthIndex: 15,
        expected: "0.00",
        description: "returns 0.00 for month 15 (15 previous months)",
      },
    ];

    testCases.forEach(({ monthIndex, expected, description }) => {
      it(description, () => {
        const result = calculateAverageSpend(mockMonths, monthIndex);
        expect(result).toBe(expected);
      });
    });
  });
  describe("handles multiple categories with spent in different months", () => {
    const mockMonths = [
      { month: "2022-01-01", activity: 0, categoryId: "1" },
      { month: "2022-01-01", activity: 0, categoryId: "2" },

      { month: "2022-02-01", activity: 0, categoryId: "1" },
      { month: "2022-02-01", activity: 0, categoryId: "2" },

      { month: "2022-03-01", activity: 10, categoryId: "1" },
      { month: "2022-03-01", activity: 13, categoryId: "2" },

      { month: "2022-04-01", activity: 0, categoryId: "1" },
      { month: "2022-04-01", activity: 0, categoryId: "2" },

      { month: "2022-05-01", activity: 0, categoryId: "1" },
      { month: "2022-05-01", activity: 0, categoryId: "2" },

      { month: "2022-06-01", activity: 5, categoryId: "1" },
      { month: "2022-06-01", activity: 6, categoryId: "2" },

      { month: "2022-07-01", activity: 0, categoryId: "1" },
      { month: "2022-07-01", activity: 0, categoryId: "2" },

      { month: "2022-08-01", activity: 0, categoryId: "1" },
      { month: "2022-08-01", activity: 0, categoryId: "2" },

      { month: "2022-09-01", activity: 0, categoryId: "1" },
      { month: "2022-09-01", activity: 0, categoryId: "2" },

      { month: "2022-10-01", activity: 0, categoryId: "1" },
      { month: "2022-10-01", activity: 0, categoryId: "2" },

      { month: "2022-11-01", activity: 0, categoryId: "1" },
      { month: "2022-11-01", activity: 0, categoryId: "2" },

      { month: "2022-12-01", activity: 0, categoryId: "1" },
      { month: "2022-12-01", activity: 0, categoryId: "2" },

      { month: "2023-01-01", activity: 0, categoryId: "1" },
      { month: "2023-01-01", activity: 0, categoryId: "2" },

      { month: "2023-02-01", activity: 0, categoryId: "1" },
      { month: "2023-02-01", activity: 0, categoryId: "2" },

      { month: "2023-03-01", activity: 0, categoryId: "1" },
      { month: "2023-03-01", activity: 0, categoryId: "2" },

      { month: "2023-04-01", activity: 0, categoryId: "1" },
      { month: "2023-04-01", activity: 0, categoryId: "2" },
    ];

    const testCases = [
      {
        monthIndex: 0,
        expected: "0.00",
        description: "returns 0.00 for month 0 (no previous months)",
      },
      {
        monthIndex: 1,
        expected: "0.00",
        description: "calculates average for month 1 (1 previous month)",
      },
      {
        monthIndex: 2,
        expected: "0.00",
        description: "calculates average for month 2 (2 previous months)",
      },
      {
        monthIndex: 3,
        expected: "23.00",
        description: "calculates average for month 3 (3 previous months)",
      },
      {
        monthIndex: 4,
        expected: "11.50",
        description: "calculates average for month 4 (4 previous months)",
      },
      {
        monthIndex: 5,
        expected: "7.68",
        description: "calculates average for month 5 (5 previous months)",
      },
      {
        monthIndex: 12,
        expected: "3.40",
        description: "calculates average for month 12 (12 previous months)",
      },
      {
        monthIndex: 13,
        expected: "3.10",
        description: "returns 0.00 for month 13 (13 previous months)",
      },
      {
        monthIndex: 14,
        expected: "2.84",
        description: "returns 0.83 for month 14 (14 previous months)",
      },
      {
        monthIndex: 15,
        expected: "1.10",
        description: "returns 0.00 for month 15 (15 previous months)",
      },
      {
        monthIndex: 16,
        expected: "1.01",
        description: "returns 0.00 for month 16 (15 previous months)",
      },
      {
        monthIndex: 18,
        expected: "0.00",
        description: "returns 0.00 for month 18 (15 previous months)",
      },
    ];

    testCases.forEach(({ monthIndex, expected, description }) => {
      it(description, () => {
        const result = calculateAverageSpend(mockMonths, monthIndex);
        expect(result).toBe(expected);
      });
    });
  });
});
