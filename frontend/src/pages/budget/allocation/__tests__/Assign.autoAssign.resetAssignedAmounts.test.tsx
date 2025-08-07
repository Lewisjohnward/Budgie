import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import { patchMonthSpy, setupTestServer } from "./__helpers__/serverHandlers";
import {
  renderAssignComponent,
  expectButtonAmount,
  clickButtonAndWaitForModal,
  expectModalContent,
  expectCategoryRow,
  createStoreWithSelectedCategories,
  waitForApiResponse,
} from "./__helpers__/testUtils";
import { createStore } from "@/core/store/store";
import { act } from "react";
import { resetAssignedAmountAlreadyMatchedData } from "./__helpers__/mockData";

const API_URL = import.meta.env.VITE_API_URL;
const buttonText = "reset assigned amounts";

describe("Assign - Reset Assigned Amounts", () => {
  const server = setupTestServer();

  describe("no categories selected", () => {
    describe("button", () => {
      it("button displays £0.00", async () => {
        renderAssignComponent();
        await expectButtonAmount(new RegExp(`${buttonText} £0\.00`, "i"));
      });
    });
    describe("modal", () => {
      it("displays categories to update correctly", async () => {
        const store = createStore();
        renderAssignComponent(store);

        await waitForApiResponse(100);

        await clickButtonAndWaitForModal(
          new RegExp(`${buttonText} £0\.00`, "i")
        );

        const categoryCount = await screen.findByText(/1 category/i);
        expect(categoryCount).toBeInTheDocument();

        const categoryGroupText = await screen.findByText(/Bills/i);
        expect(categoryGroupText).toBeInTheDocument();

        await expectCategoryRow("Groceries", "-£500.00");
      });

      it("displays will not update message when no months to update", async () => {
        server.use(
          http.get(`${API_URL}/budget/category`, () => {
            return HttpResponse.json(resetAssignedAmountAlreadyMatchedData);
          })
        );

        renderAssignComponent();
        await waitForApiResponse(100);

        await clickButtonAndWaitForModal(
          new RegExp(`${buttonText} £0\.00`, "i")
        );

        await expectModalContent(
          /This will not update the assigned amount for any categories./i
        );
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
            months: ["m3", "m4"],
            userId: "user1",
            position: 0,
          },
        ]);

        renderAssignComponent(store);

        const assignedLastMonthButton = await expectButtonAmount(
          new RegExp(`${buttonText} £0\.00`, "i")
        );

        expect(assignedLastMonthButton).toBeInTheDocument();
      });
      it("when pressed calls api", async () => {
        const store = createStoreWithSelectedCategories([
          {
            id: "c2",
            name: "Groceries",
            categoryGroupId: "cg1",
            months: ["m3", "m4"],
            userId: "user1",
            position: 0,
          },
        ]);

        renderAssignComponent(store);
        await waitForApiResponse(100);

        const assignedLastMonthButton = await expectButtonAmount(
          new RegExp(`${buttonText} £0\.00`, "i")
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

        renderAssignComponent(store);
        await waitForApiResponse(100);

        const assignedLastMonthButton = await expectButtonAmount(
          new RegExp(`${buttonText} £0\.00`, "i")
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
