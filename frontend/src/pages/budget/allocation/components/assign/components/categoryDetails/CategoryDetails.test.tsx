import { render, screen, fireEvent } from "@testing-library/react";
import { within } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AllocationData } from "@/core/types/Allocation";
import { CategoryDetails } from "./CategoryDetails";
import { SelectedCategoriesState } from "../../hooks/useSelectedCategories";

type CategoryDetailsProps = SelectedCategoriesState;

const API_URL = import.meta.env.VITE_API_URL;

const mockAllocationDataMonthView: AllocationData = {
  categories: {
    c1: {
      id: "c1",
      name: "Rent",
      categoryGroupId: "cg1",
      months: ["m1", "m2"],
      userId: "user1",
      position: 0,
      transactions: [],
    },
  },
  categoryGroups: {
    cg1: {
      id: "cg1",
      name: "Bills",
      categories: ["c1"],
      budgetLimit: 0,
    },
  },
  months: {
    m1: {
      id: "m1",
      month: "2025-08-01T00:00:00.000Z",
      activity: 0,
      assigned: 1200,
      available: 1200,
      categoryId: "c1",
    },
    m2: {
      id: "m2",
      month: "2025-09-01T00:00:00.000Z",
      activity: 0,
      assigned: 0,
      available: 1200,
      categoryId: "c1",
    },
  },
};

const mockAllocationDataCategoryView: AllocationData = {
  categories: {
    c1: {
      id: "c1",
      name: "Rent",
      categoryGroupId: "cg1",
      months: ["m1", "m2"],
      userId: "user1",
      position: 0,
      transactions: [],
    },
    c2: {
      id: "c2",
      name: "Groceries",
      categoryGroupId: "cg1",
      months: ["m3", "m4"],
      userId: "user1",
      position: 1,
      transactions: [],
    },
  },
  categoryGroups: {
    cg1: {
      id: "cg1",
      name: "Bills",
      categories: ["c1", "c2"],
      budgetLimit: 0,
    },
  },
  months: {
    m1: {
      id: "m1",
      month: "2025-08-01T00:00:00.000Z",
      activity: 0,
      assigned: 1200,
      available: 1200,
      categoryId: "c1",
    },
    m2: {
      id: "m2",
      month: "2025-09-01T00:00:00.000Z",
      activity: 0,
      assigned: 0,
      available: 1200,
      categoryId: "c1",
    },
    m3: {
      id: "m3",
      month: "2025-08-01T00:00:00.000Z",
      activity: 0,
      assigned: 100,
      available: 100,
      categoryId: "c2",
    },
    m4: {
      id: "m4",
      month: "2025-09-01T00:00:00.000Z",
      activity: -10,
      assigned: 0,
      available: 90,
      categoryId: "c2",
    },
  },
};

const mockAllocationDataOverspent: AllocationData = {
  categories: {
    c1: {
      id: "c1",
      name: "Rent",
      categoryGroupId: "cg1",
      months: ["m1"],
      userId: "user1",
      position: 0,
      transactions: [],
    },
  },
  categoryGroups: {
    cg1: {
      id: "cg1",
      name: "Bills",
      categories: ["c1"],
      budgetLimit: 0,
    },
  },
  months: {
    m1: {
      id: "m1",
      month: "2025-08-01T00:00:00.000Z",
      activity: 1200,
      assigned: 0,
      available: -1200,
      categoryId: "c1",
    },
  },
};

describe.skip("CategoryDetails", () => {
  const renderCategoryDetails = (props: CategoryDetailsProps) => {
    return render(<CategoryDetails {...props} />);
  };

  describe("month view", () => {
    it("should display the correct initial month balance after fetching data", async () => {
      renderCategoryDetails(mockAllocationDataMonthView);

      expect(await screen.findByText(/August's Balance/i)).toBeInTheDocument();

      const leftoverRow = screen
        .getByText("Left Over from Last Month")
        .closest("div");
      expect(leftoverRow).toHaveTextContent("£0.00");

      const assignedRow = screen.getByText("Assigned in August").closest("div");
      expect(assignedRow).toHaveTextContent("£1200.00");

      const spendingRow = screen.getByText("Activity").closest("div");
      expect(spendingRow).toHaveTextContent("£0.00");

      const availableRow = screen.getByText("Available").closest("div");
      expect(availableRow).toHaveTextContent("£1200.00");
    });

    it("should toggle details when toggled", async () => {
      renderCategoryDetails(mockAllocationDataMonthView);

      expect(await screen.findByText(/August's Balance/i)).toBeInTheDocument();

      const toggleButton = screen.getByRole("button");
      fireEvent.click(toggleButton);

      expect(
        screen.queryByText("Left Over from Last Month"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Assigned in August")).not.toBeInTheDocument();
      expect(screen.queryByText("Activity")).not.toBeInTheDocument();
      expect(screen.queryByText("Available")).not.toBeInTheDocument();

      fireEvent.click(toggleButton);

      expect(screen.getByText("Left Over from Last Month")).toBeInTheDocument();
      expect(screen.getByText("Assigned in August")).toBeInTheDocument();
      expect(screen.getByText("Activity")).toBeInTheDocument();
      expect(screen.getByText("Available")).toBeInTheDocument();
    });

    it("should correctly display another month", async () => {
      renderCategoryDetails(mockAllocationDataMonthView);

      expect(
        await screen.findByText(/September's Balance/i),
      ).toBeInTheDocument();
      const leftoverRow = screen
        .getByText("Left Over from Last Month")
        .closest("div");
      expect(leftoverRow).toHaveTextContent("£1200.00");

      const assignedRow = screen
        .getByText("Assigned in September")
        .closest("div");
      expect(assignedRow).toHaveTextContent("£0.00");

      const spendingRow = screen.getByText("Activity").closest("div");
      expect(spendingRow).toHaveTextContent("£0.00");

      const availableRow = screen.getByText("Available").closest("div");
      expect(availableRow).toHaveTextContent("£1200.00");
    });
  });

  // describe.skip("category view", () => {

  //   it("should display a summary for a single selected category", async () => {
  //     renderCategoryDetails(0, [
  //       {
  //         id: "c1",
  //         name: "Rent",
  //         categoryGroupId: "cg1",
  //         months: ["m1", "m2"],
  //         userId: "user1",
  //         position: 0,
  //         transactions: [],
  //       },
  //     ]);

  //     expect(await screen.findByText(/rent/i)).toBeInTheDocument();

  //     const button = screen.getByRole("button", { name: /available balance/i });
  //     expect(within(button).getByText("£1200.00")).toBeInTheDocument();

  //     const leftoverRow = screen
  //       .getByText("Cash Left Over from Last Month")
  //       .closest("div");
  //     expect(leftoverRow).toHaveTextContent("£0.00");

  //     const assignedRow = screen
  //       .getByText("Assigned this month")
  //       .closest("div");
  //     expect(assignedRow).toHaveTextContent("£1200.00");

  //     const spendingRow = screen.getByText("Cash Spending").closest("div");
  //     expect(spendingRow).toHaveTextContent("£0.00");
  //   });

  //   it("should display a summary for multiple selected categories", async () => {
  //     renderCategoryDetails(0, [
  //       {
  //         id: "c1",
  //         name: "Rent",
  //         categoryGroupId: "cg1",
  //         months: ["m1", "m2"],
  //         userId: "user1",
  //         position: 0,
  //         transactions: []
  //       },
  //       {
  //         id: "c2",
  //         name: "Groceries",
  //         categoryGroupId: "cg2",
  //         months: ["m3", "m4"],
  //         userId: "user1",
  //         position: 1,
  //         transactions: [],
  //       },
  //     ]);

  //     expect(
  //       await screen.findByText(/2 categories selected/i),
  //     ).toBeInTheDocument();
  //     expect(await screen.findByText(/rent/i)).toBeInTheDocument();
  //     expect(await screen.findByText(/groceries/i)).toBeInTheDocument();

  //     const button = screen.getByRole("button", { name: /available balance/i });
  //     expect(within(button).getByText("£1300.00")).toBeInTheDocument();

  //     const leftoverRow = screen
  //       .getByText("Cash Left Over from Last Month")
  //       .closest("div");
  //     expect(leftoverRow).toHaveTextContent("£0.00");

  //     const assignedRow = screen
  //       .getByText("Assigned this month")
  //       .closest("div");
  //     expect(assignedRow).toHaveTextContent("£1300.00");

  //     const spendingRow = screen.getByText("Cash Spending").closest("div");
  //     expect(spendingRow).toHaveTextContent("£0.00");
  //   });

  //   it("should toggle details when toggled", async () => {
  //     renderCategoryDetails(0, [
  //       {
  //         id: "c1",
  //         name: "Rent",
  //         categoryGroupId: "cg1",
  //         months: ["m1", "m2"],
  //         userId: "user1",
  //         position: 0,
  //         transactions: [],
  //       },
  //       {
  //         id: "c2",
  //         name: "Groceries",
  //         categoryGroupId: "cg2",
  //         months: ["m3", "m4"],
  //         userId: "user1",
  //         position: 1,
  //         transactions: [],
  //       },
  //     ]);

  //     expect(
  //       await screen.findByText(/2 categories selected/i),
  //     ).toBeInTheDocument();
  //     expect(await screen.findByText(/rent/i)).toBeInTheDocument();
  //     expect(await screen.findByText(/groceries/i)).toBeInTheDocument();

  //     const button = screen.getByRole("button", { name: /available balance/i });
  //     expect(within(button).getByText("£1300.00")).toBeInTheDocument();

  //     const leftoverRow = screen
  //       .getByText("Cash Left Over from Last Month")
  //       .closest("div");
  //     expect(leftoverRow).toHaveTextContent("£0.00");

  //     const assignedRow = screen
  //       .getByText("Assigned this month")
  //       .closest("div");
  //     expect(assignedRow).toHaveTextContent("£1300.00");

  //     const spendingRow = screen.getByText("Cash Spending").closest("div");
  //     expect(spendingRow).toHaveTextContent("£0.00");

  //     const toggleButton = screen.getByRole("button");
  //     fireEvent.click(toggleButton);

  //     expect(
  //       screen.queryByText("Cash Left Over from Last Month"),
  //     ).not.toBeInTheDocument();
  //     expect(screen.queryByText("Assigned this month")).not.toBeInTheDocument();
  //     expect(screen.queryByText("Cash Spending")).not.toBeInTheDocument();

  //     fireEvent.click(toggleButton);

  //     expect(
  //       screen.getByText("Cash Left Over from Last Month"),
  //     ).toBeInTheDocument();
  //     expect(screen.getByText("Assigned this month")).toBeInTheDocument();
  //     expect(screen.getByText("Cash Spending")).toBeInTheDocument();
  //   });

  //   it("should handle changing month for multiple selected categories", async () => {
  //     renderCategoryDetails(1, [
  //       {
  //         id: "c1",
  //         name: "Rent",
  //         categoryGroupId: "cg1",
  //         months: ["m1", "m2"],
  //         userId: "user1",
  //         position: 0,
  //         transactions: [],
  //       },
  //       {
  //         id: "c2",
  //         name: "Groceries",
  //         categoryGroupId: "cg2",
  //         months: ["m3", "m4"],
  //         userId: "user1",
  //         position: 1,
  //         transactions: [],
  //       },
  //     ]);

  //     expect(
  //       await screen.findByText(/2 categories selected/i),
  //     ).toBeInTheDocument();
  //     expect(await screen.findByText(/rent/i)).toBeInTheDocument();
  //     expect(await screen.findByText(/groceries/i)).toBeInTheDocument();

  //     const button = screen.getByRole("button", { name: /available balance/i });
  //     expect(within(button).getByText("£1290.00")).toBeInTheDocument();

  //     const leftoverRow = screen
  //       .getByText("Cash Left Over from Last Month")
  //       .closest("div");
  //     expect(leftoverRow).toHaveTextContent("£1300.00");

  //     const assignedRow = screen
  //       .getByText("Assigned this month")
  //       .closest("div");
  //     expect(assignedRow).toHaveTextContent("£0.00");

  //     const spendingRow = screen.getByText("Cash Spending").closest("div");
  //     expect(spendingRow).toHaveTextContent("-£10.00");
  //   });

  //   it("should show overspent warning when available is negative", async () => {
  //     server.use(
  //       http.get(`${API_URL}/budget/category`, () => {
  //         return HttpResponse.json(mockAllocationDataOverspent);
  //       }),
  //     );
  //     renderCategoryDetails(0, [
  //       {
  //         id: "c1",
  //         name: "Rent",
  //         categoryGroupId: "cg1",
  //         months: ["m1", "m2"],
  //         userId: "user1",
  //         position: 0,
  //         transactions: [],
  //       },
  //     ]);

  //     expect(await screen.findByText(/rent/i)).toBeInTheDocument();
  //     expect(
  //       screen.getByText(/you've overspent this category by/i),
  //     ).toBeInTheDocument();
  //   });
  // });

  describe("Uncategorised Transactions", () => {
    it.todo("should correctly display uncategorised transations details");

    // I THINK THIS IS WILL PASS BECAUSE ITS JUST ANOTHER CATEGORY
    // WILL IT DISPLAY "-" if there is no prev month
  });
});
