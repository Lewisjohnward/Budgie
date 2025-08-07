import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import { patchMonthSpy, setupTestServer } from "./__helpers__/serverHandlers";
import {
  spentLastMonthData,
  spentLastMonthAlreadyMatchedData,
} from "./__helpers__/mockData";
import {
  renderAssignComponent,
  createStoreWithMonthIndex,
  expectButtonAmount,
  clickButtonAndWaitForModal,
  expectModalContent,
  expectCategoryRow,
  createStoreWithSelectedCategories,
  selectMonth,
} from "./__helpers__/testUtils";
import { act } from "react";

const API_URL = import.meta.env.VITE_API_URL;

describe("Assign - Spent Last Month", () => {
  const server = setupTestServer();

  beforeEach(() => {
    server.use(
      http.get(`${API_URL}/budget/category`, () => {
        return HttpResponse.json(spentLastMonthData);
      })
    );
  });

  describe("no categories selected", () => {
    describe("no previous month", () => {
      describe("button", () => {
        it("button displays £0.00 when no previous month", async () => {
          renderAssignComponent();
          await expectButtonAmount(/spent last month £0\.00/i);
        });
      });
      describe("modal", () => {
        it("modal displays no categories to update message", async () => {
          renderAssignComponent();
          await clickButtonAndWaitForModal(/spent last month £0\.00/i);
          await expectModalContent(
            /this will not update the assigned amount for any categories/i
          );
        });
      });
    });
    describe("previous months present", () => {
      describe("button", () => {
        it("button displays correct amount", async () => {
          const store = createStoreWithMonthIndex(1);
          renderAssignComponent(store);

          await expectButtonAmount(/spent last month £50\.99/i);
        });
      });
      describe("modal", () => {
        it("displays categories to update correctly", async () => {
          const store = createStoreWithMonthIndex(1);
          renderAssignComponent(store);

          await clickButtonAndWaitForModal(/spent last month £50\.99/i);

          const categoryCount = await screen.findByText(/2 categories/i);
          expect(categoryCount).toBeInTheDocument();

          const categoryGroupText = await screen.findByText(/Bills/i);
          expect(categoryGroupText).toBeInTheDocument();

          await expectCategoryRow("Rent", "-£450.99");
          await expectCategoryRow("Groceries", "+£0.99");
        });

        it("displays will not update message when no months to update", async () => {
          server.use(
            http.get(`${API_URL}/budget/category`, () => {
              return HttpResponse.json(spentLastMonthAlreadyMatchedData);
            })
          );

          const store = createStoreWithMonthIndex(1);
          renderAssignComponent(store);

          await clickButtonAndWaitForModal(/spent last month £50\.99/i);

          await expectModalContent(
            /This will not update the assigned amount for any categories./i
          );
        });
      });
    });
  });
  describe("categories selected", () => {
    describe("button", () => {
      it("displays correct amount", async () => {
        const store = createStoreWithSelectedCategories([
          {
            id: "c1",
            name: "Rent",
            categoryGroupId: "cg1",
            months: ["m1", "m2"],
            userId: "user1",
            position: 0,
          },
        ]);

        selectMonth(store, 1);

        renderAssignComponent(store);

        const assignedLastMonthButton = await expectButtonAmount(
          /spent last month £50\.00/i
        );

        expect(assignedLastMonthButton).toBeInTheDocument();
      });
      it("when pressed calls api", async () => {
        const store = createStoreWithSelectedCategories([
          {
            id: "c1",
            name: "Rent",
            categoryGroupId: "cg1",
            months: ["m1", "m2"],
            userId: "user1",
            position: 0,
          },
        ]);

        selectMonth(store, 1);

        renderAssignComponent(store);

        const assignedLastMonthButton = await expectButtonAmount(
          /spent last month £50\.00/i
        );

        await act(async () => {
          assignedLastMonthButton.click();
        });

        await waitFor(() => {
          expect(patchMonthSpy).toHaveBeenCalled();
        });
      });
    });
    describe("modal", () => {
      it("modal is not shown on click", async () => {
        const store = createStoreWithSelectedCategories([
          {
            id: "c1",
            name: "Rent",
            categoryGroupId: "cg1",
            months: ["m1", "m2"],
            userId: "user1",
            position: 0,
          },
        ]);

        selectMonth(store, 1);

        renderAssignComponent(store);

        const assignedLastMonthButton = await expectButtonAmount(
          /spent last month £50\.00/i
        );

        await act(async () => {
          assignedLastMonthButton.click();
        });
        const modal = await screen.queryByRole("dialog");

        expect(modal).not.toBeInTheDocument();
      });
    });
  });
});
