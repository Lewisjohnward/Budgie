import { Category, CategoryGroup, Month } from "@/core/types/Allocation";
import { FundingStatus } from "../types/assignTypes";
import { generateAssignedLastMonthState } from "./generateAssignedLastMonthState";

describe("generateAssignedLastMonthState", () => {
  describe("with a single underfunded category", () => {
    const categoryGroups: Record<string, CategoryGroup> = {
      "1": {
        id: "1",
        name: "Group 1",
        categories: ["1"],
      },
    };

    const categories: Record<string, Category> = {
      "1": {
        id: "1",
        name: "Category 1",
        categoryGroupId: "1",
        userId: "1",
        position: 1,
        months: ["1", "2"],
        transactions: [],
      },
    };

    const months: Month[] = [
      {
        month: "2025-08-01",
        available: 0,
        activity: 0,
        assigned: 0.5,
        categoryId: "1",
        id: "1",
      },
      {
        month: "2025-09-01",
        available: 0,
        activity: 0,
        assigned: 0.49,
        categoryId: "1",
        id: "2",
      },
    ];

    it("should not have rounding error", () => {
      const result = generateAssignedLastMonthState(
        categoryGroups,
        categories,
        months.slice(1, 2),
        months.slice(0, 1)
      );

      const expectedResult = {
        monthsToUpdate: [
          {
            assigned: 0.5,
            monthId: "2",
          },
        ],
        uiState: {
          status: FundingStatus.AssignedLastMonth,
          categories: [
            {
              categories: [
                {
                  amount: 0.01,
                  name: "Category 1",
                },
              ],
              name: "Group 1",
            },
          ],
          noCategoriesToUpdate: false,
        },
      };

      expect(result).toEqual(expectedResult);
    });
  });
});
