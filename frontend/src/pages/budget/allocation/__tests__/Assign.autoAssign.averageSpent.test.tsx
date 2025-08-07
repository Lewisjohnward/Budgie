import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import { patchMonthSpy, setupTestServer } from "./__helpers__/serverHandlers";
import {
  averageSpentData,
  averageSpentAlreadyMatchedData,
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
const buttonText = "average spent";

describe("Assign - Average Spent", () => {
  const server = setupTestServer();

  beforeEach(() => {
    server.use(
      http.get(`${API_URL}/budget/category`, () => {
        return HttpResponse.json(averageSpentData);
      })
    );
  });

  describe("no categories selected", () => {
    describe("no previous months", () => {
      describe("button", () => {
        it("button displays £0.00 when no previous month", async () => {
          renderAssignComponent();
          await expectButtonAmount(new RegExp(`${buttonText} £0\.00`, "i"));
        });
      });
      describe("modal", () => {
        it("modal displays no categories to update message", async () => {
          renderAssignComponent();
          await clickButtonAndWaitForModal(
            new RegExp(`${buttonText} £0\.00`, "i")
          );
          await expectModalContent(
            /this will not update the assigned amount for any categories/i
          );
        });
      });
    });
    describe("previous months present", () => {
      describe("button", () => {
        it("button displays correct amount", async () => {
          const store = createStoreWithMonthIndex(3);
          renderAssignComponent(store);

          await expectButtonAmount(new RegExp(`${buttonText} £20\.33`, "i"));
        });
      });
      describe("modal", () => {
        it("displays categories to update correctly", async () => {
          const store = createStoreWithMonthIndex(3);
          renderAssignComponent(store);

          await clickButtonAndWaitForModal(
            new RegExp(`${buttonText} £20\.33`, "i")
          );
          const categoryCount = await screen.findByText(/2 categories/i);
          expect(categoryCount).toBeInTheDocument();

          const categoryGroupText = await screen.findByText(/Bills/i);
          expect(categoryGroupText).toBeInTheDocument();

          await expectCategoryRow("Rent", "+£20.00");
          await expectCategoryRow("Groceries", "+£0.33");
        });

        it("displays will not update message when no months to update", async () => {
          server.use(
            http.get(`${API_URL}/budget/category`, () => {
              return HttpResponse.json(averageSpentAlreadyMatchedData);
            })
          );

          const store = createStoreWithMonthIndex(3);
          renderAssignComponent(store);

          await clickButtonAndWaitForModal(
            new RegExp(`${buttonText} £20\.33`, "i")
          );

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
            id: "c2",
            name: "Groceries",
            categoryGroupId: "cg1",
            months: ["m3", "m4", "m6", "m8"],
            userId: "user1",
            position: 0,
          },
        ]);

        selectMonth(store, 3);

        renderAssignComponent(store);

        const assignedLastMonthButton = await expectButtonAmount(
          new RegExp(`${buttonText} £0\.33`, "i")
        );

        expect(assignedLastMonthButton).toBeInTheDocument();
      });
      it("when pressed calls api", async () => {
        const store = createStoreWithSelectedCategories([
          {
            id: "c1",
            name: "Rent",
            categoryGroupId: "cg1",
            months: ["m1", "m2", "m5", "m7"],
            userId: "user1",
            position: 0,
          },
        ]);

        selectMonth(store, 3);

        renderAssignComponent(store);

        const assignedLastMonthButton = await expectButtonAmount(
          new RegExp(`${buttonText} £20\.00`, "i")
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
            months: ["m1", "m2", "m5", "m7"],
            userId: "user1",
            position: 0,
          },
        ]);

        selectMonth(store, 3);

        renderAssignComponent(store);

        const assignedLastMonthButton = await expectButtonAmount(
          new RegExp(`${buttonText} £20\.00`, "i")
        );

        await act(async () => {
          assignedLastMonthButton.click();
        });
        const modal = screen.queryByRole("dialog");

        expect(modal).not.toBeInTheDocument();
      });
    });
  });
});
