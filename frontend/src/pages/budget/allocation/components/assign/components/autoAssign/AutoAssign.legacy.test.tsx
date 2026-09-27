import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { AllocationData } from "@/core/types/Allocation";
import { AutoAssign } from "./AutoAssign";
import { Provider } from "react-redux";
import { createStore } from "@/core/store/store";
import { selectMonthIndex } from "../../../../slices/monthSlice";

const API_URL = import.meta.env.VITE_API_URL;

const mockAllocationData: AllocationData = {
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
    c3: {
      id: "c3",
      name: "Ready to Assign",
      categoryGroupId: "cg2",
      months: ["m5", "m6"],
      userId: "user1",
      position: 0,
      transactions: [],
    },
    c4: {
      id: "c4",
      name: "Uncategorised Transactions",
      categoryGroupId: "cg2",
      months: ["m7", "m8"],
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
    cg2: {
      id: "cg2",
      name: "System",
      categories: ["c3", "c4"],
      budgetLimit: 0,
    },
  },
  months: {
    m1: {
      id: "m1",
      month: "2025-08-01T00:00:00.000Z",
      assigned: 0,
      activity: -1200,
      available: -1200,
      categoryId: "c1",
    },
    m3: {
      id: "m3",
      month: "2025-08-01T00:00:00.000Z",
      assigned: 500,
      activity: 0,
      available: 500,
      categoryId: "c2",
    },
    m2: {
      id: "m2",
      month: "2025-09-01T00:00:00.000Z",
      assigned: 0,
      activity: 0,
      available: 0,
      categoryId: "c1",
    },
    m4: {
      id: "m4",
      month: "2025-09-01T00:00:00.000Z",
      activity: 0,
      assigned: 0,
      available: 500,
      categoryId: "c2",
    },
    // Ready to assign
    m5: {
      id: "m5",
      month: "2025-08-01T00:00:00.000Z",
      assigned: 0,
      activity: 0,
      available: -500,
      categoryId: "c3",
    },
    m6: {
      id: "m6",
      month: "2025-09-01T00:00:00.000Z",
      assigned: 0,
      activity: 0,
      available: -1750,
      categoryId: "c3",
    },
    // Uncategorised
    m7: {
      id: "m7",
      month: "2025-08-01T00:00:00.000Z",
      assigned: 0,
      activity: -50,
      available: -50,
      categoryId: "c4",
    },
    m8: {
      id: "m8",
      month: "2025-09-01T00:00:00.000Z",
      assigned: 0,
      activity: 0,
      available: 0,
      categoryId: "c4",
    },
  },
};

const handlers = [
  http.get(`${API_URL}/budget/category`, () => {
    return HttpResponse.json(mockAllocationData);
  }),
];

describe.skip("AutoAssign", () => {
  const server = setupServer(...handlers);

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("When no category selected", () => {
    it("should render the auto assign component", async () => {
      const store = createStore();
      render(
        <Provider store={store}>
          <AutoAssign />
        </Provider>,
      );

      await waitFor(async () => {
        const fundButton = await screen.findByRole("button", {
          name: /underfunded/i,
        });
        expect(fundButton).toBeInTheDocument();
        expect(fundButton).toHaveTextContent("£1200.00");

        const resetAssignedButton = await screen.findByRole("button", {
          name: /reset assigned amount/i,
        });
        expect(resetAssignedButton).toBeInTheDocument();
        expect(resetAssignedButton).toHaveTextContent("£0.00");

        const resetAvailableButton = await screen.findByRole("button", {
          name: /reset available amount/i,
        });
        expect(resetAvailableButton).toBeInTheDocument();
        expect(resetAvailableButton).toHaveTextContent("£0.00");
      });
    });

    it("should correctly handle rta and uncategorised categories", async () => {
      const store = createStore();
      store.dispatch(selectMonthIndex(1));
      render(
        <Provider store={store}>
          <AutoAssign />
        </Provider>,
      );

      await waitFor(async () => {
        let fundButton = await screen.findByRole("button", {
          name: /underfunded/i,
        });
        expect(fundButton).toBeInTheDocument();
        expect(fundButton).toHaveTextContent("£0.00");
        const resetAssignedButton = await screen.findByRole("button", {
          name: /reset assigned amount/i,
        });
        expect(resetAssignedButton).toBeInTheDocument();
        expect(resetAssignedButton).toHaveTextContent("£0.00");

        const resetAvailableButton = await screen.findByRole("button", {
          name: /reset available amount/i,
        });
        expect(resetAvailableButton).toBeInTheDocument();
        expect(resetAvailableButton).toHaveTextContent("£0.00");
      });
    });
  });
});
