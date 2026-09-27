import { Category, CategoryGroup, Month } from "@/core/types/Allocation";
import { generateUnderfundedState } from "./generateUnderfundedState";
import { FundingLevel, FundingStatus } from "../types/assignTypes";

describe("generateUnderfundedState", () => {
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
        months: ["1"],
        transactions: [],
      },
    };

    const months: Month[] = [
      {
        month: "2025-09-01",
        available: -100,
        activity: 0,
        assigned: 0,
        categoryId: "1",
        id: "1",
      },
    ];

    it("should fully fund the month when RTA is sufficient", () => {
      const rtaAvailable = 100;

      const result = generateUnderfundedState(
        categoryGroups,
        categories,
        months,
        rtaAvailable
      );

      const expectedResult = {
        monthsToUpdate: [
          {
            assigned: 100,
            monthId: "1",
          },
        ],
        uiState: {
          status: FundingStatus.Underfunded,
          fundingLevel: FundingLevel.Funded,
          fullyFundedCategories: [
            {
              name: "Group 1",
              categories: [{ name: "Category 1", amount: 100 }],
            },
          ],
        },
      };

      expect(result).toEqual(expectedResult);
    });

    it("should fund the month when RTA is 0 and dontConsiderRtaAvailable is true", () => {
      const rtaAvailable = 0;
      const ignoreRtaAvailable = true;

      const result = generateUnderfundedState(
        categoryGroups,
        categories,
        months,
        rtaAvailable,
        ignoreRtaAvailable
      );

      const expectedResult = {
        monthsToUpdate: [
          {
            assigned: 100,
            monthId: "1",
          },
        ],
        uiState: {
          status: FundingStatus.Underfunded,
          fundingLevel: FundingLevel.Funded,
          fullyFundedCategories: [
            {
              name: "Group 1",
              categories: [{ name: "Category 1", amount: 100 }],
            },
          ],
        },
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe("with multiple underfunded months", () => {
    const categoryGroups: Record<string, CategoryGroup> = {
      "1": {
        id: "1",
        name: "Group 1",
        categories: ["1", "2"],
      },
      "2": {
        id: "2",
        name: "Group 2",
        categories: ["3", "4"],
      },
    };

    const categories: Record<string, Category> = {
      "1": {
        id: "1",
        name: "Category 1",
        categoryGroupId: "1",
        userId: "1",
        position: 1,
        months: ["1"],
        transactions: [],
      },
      "2": {
        id: "2",
        name: "Category 2",
        categoryGroupId: "1",
        userId: "1",
        position: 2,
        months: ["2"],
        transactions: [],
      },
      "3": {
        id: "3",
        name: "Category 3",
        categoryGroupId: "2",
        userId: "1",
        position: 3,
        months: ["3"],
        transactions: [],
      },
      "4": {
        id: "4",
        name: "Category 4",
        categoryGroupId: "2",
        userId: "1",
        position: 4,
        months: ["4"],
        transactions: [],
      },
    };

    const months: Month[] = [
      {
        month: "2025-09-01",
        available: -500,
        activity: 0,
        assigned: 0,
        categoryId: "1",
        id: "1",
      },
      {
        month: "2025-09-01",
        available: -500,
        activity: 0,
        assigned: 0,
        categoryId: "2",
        id: "2",
      },
      {
        month: "2025-09-01",
        available: -5,
        activity: 0,
        assigned: 0,
        categoryId: "3",
        id: "3",
      },
      {
        month: "2025-09-01",
        available: -500,
        activity: 0,
        assigned: 0,
        categoryId: "4",
        id: "4",
      },
    ];

    it("should fully fund some and partially fund the last one when RTA is partially sufficient", () => {
      const rtaAvailable = 1500;

      const result = generateUnderfundedState(
        categoryGroups,
        categories,
        months,
        rtaAvailable
      );

      const expectedResult = {
        monthsToUpdate: [
          {
            assigned: 500,
            monthId: "1",
          },
          {
            assigned: 500,
            monthId: "2",
          },
          {
            assigned: 5,
            monthId: "3",
          },
          {
            assigned: 495,
            monthId: "4",
          },
        ],
        uiState: {
          status: FundingStatus.Underfunded,
          fundingLevel: FundingLevel.Funded,
          partiallyFundedCategory: {
            name: "Group 2",
            category: { name: "Category 4", amount: 495, percentFunded: 99 },
          },
          fullyFundedCategories: [
            {
              name: "Group 1",
              categories: [
                { name: "Category 1", amount: 500 },
                { name: "Category 2", amount: 500 },
              ],
            },
            {
              name: "Group 2",
              categories: [{ name: "Category 3", amount: 5 }],
            },
          ],
        },
      };

      expect(result).toEqual(expectedResult);
    });

    it("should fully fund when RTA is sufficient", () => {
      const rtaAvailable = 1505;

      const result = generateUnderfundedState(
        categoryGroups,
        categories,
        months,
        rtaAvailable
      );

      const expectedResult = {
        monthsToUpdate: [
          {
            assigned: 500,
            monthId: "1",
          },
          {
            assigned: 500,
            monthId: "2",
          },
          {
            assigned: 5,
            monthId: "3",
          },
          {
            assigned: 500,
            monthId: "4",
          },
        ],
        uiState: {
          status: FundingStatus.Underfunded,
          fundingLevel: FundingLevel.Funded,
          fullyFundedCategories: [
            {
              name: "Group 1",
              categories: [
                { name: "Category 1", amount: 500 },
                { name: "Category 2", amount: 500 },
              ],
            },
            {
              name: "Group 2",
              categories: [
                { name: "Category 3", amount: 5 },
                { name: "Category 4", amount: 500 },
              ],
            },
          ],
        },
      };
      expect(result).toEqual(expectedResult);
    });

    it("should return an overfunded status when RTA is more than enough", () => {
      const rtaAvailable = 0;

      const result = generateUnderfundedState(
        categoryGroups,
        categories,
        months,
        rtaAvailable
      );

      expect(result.uiState.status).toEqual(FundingStatus.Underfunded);
      if ("fundingLevel" in result.uiState) {
        expect(result.uiState.fundingLevel).toEqual(FundingLevel.NoMoney);
      }
    });

    it("should not get precision error", () => {
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
          months: ["1"],
          transactions: [],
        },
      };

      const months: Month[] = [
        {
          month: "2025-09-01",
          available: -0.85,
          activity: -80.85,
          assigned: 80,
          categoryId: "1",
          id: "1",
        },
      ];
      const rtaAvailable = 78.74;

      const result = generateUnderfundedState(
        categoryGroups,
        categories,
        months,
        rtaAvailable
      );

      const expectedResult = {
        monthsToUpdate: [
          {
            assigned: 80.85,
            monthId: "1",
          },
        ],
        uiState: {
          status: FundingStatus.Underfunded,
          fundingLevel: FundingLevel.Funded,
          fullyFundedCategories: [
            {
              name: "Group 1",
              categories: [{ name: "Category 1", amount: 0.85 }],
            },
          ],
        },
      };
      expect(result).toEqual(expectedResult);
    });
  });
});
