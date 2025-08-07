import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import { patchMonthSpy, setupTestServer } from "./__helpers__/serverHandlers";
import {
  assignedLastMonthData,
  assignedLastMonthAlreadyMatchedData,
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
  expectCategoryGroup,
} from "./__helpers__/testUtils";
import { act } from "react";

const API_URL = import.meta.env.VITE_API_URL;

describe("Assign - Assigned Last Month", () => {
  const server = setupTestServer();

  beforeEach(() => {
    server.use(
      http.get(`${API_URL}/budget/category`, () => {
        return HttpResponse.json(assignedLastMonthData);
      })
    );
  });

  describe("button", () => {
    describe("no categories selected", () => {
      describe("when no previous month", () => {
        it("button displays £0.00", async () => {
          renderAssignComponent();
          await expectButtonAmount(/assigned last month £0\.00/i);
        });
      });

      it("button displays correct amount", async () => {
        const store = createStoreWithMonthIndex(1);
        renderAssignComponent(store);

        await expectButtonAmount(/assigned last month £1155\.98/i);
      });
    });
    describe("categories are selected", () => {
      it("displays the correct amount", async () => {
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
        await expectButtonAmount(/assigned last month £500\.99/i);
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
          /assigned last month £500\.99/i
        );

        await act(async () => {
          assignedLastMonthButton.click();
        });

        await waitFor(() => {
          expect(patchMonthSpy).toHaveBeenCalled();
        });
      });
    });
  });

  describe("modal", () => {
    it("displays correctly", async () => {
      renderAssignComponent();

      await clickButtonAndWaitForModal(/assigned last month £0\.00/i);
      await expectModalContent(
        /This will not update the assigned amount for any categories./i
      );

      const okButton = await screen.findByRole("button", { name: /ok/i });
      expect(okButton).toBeInTheDocument();
    });

    it("displays categories to update correctly", async () => {
      const store = createStoreWithMonthIndex(1);
      renderAssignComponent(store);

      await clickButtonAndWaitForModal(/assigned last month £1155\.98/i);

      const categoryCount = await screen.findByText(/2 categories/i);
      expect(categoryCount).toBeInTheDocument();

      await expectCategoryGroup(/bills/i);
      await expectCategoryRow("Rent", "-£99.01");
      await expectCategoryRow("Groceries", "+£654.99");
    });

    it("displays correct buttons", async () => {
      const store = createStoreWithMonthIndex(1);
      renderAssignComponent(store);

      await clickButtonAndWaitForModal(/assigned last month £1155\.98/i);

      await waitFor(() => {
        const cancelButton = screen.getByRole("button", {
          name: /cancel/i,
        });
        expect(cancelButton).toBeInTheDocument();
        const updateButton = screen.getByRole("button", {
          name: /update assigned amount/i,
        });
        expect(updateButton).toBeInTheDocument();
      });
    });

    it("x button closes modal", async () => {
      const store = createStoreWithMonthIndex(1);
      renderAssignComponent(store);

      await clickButtonAndWaitForModal(/assigned last month £1155\.98/i);
      await expectCategoryGroup(/bills/i);

      const closeButton = screen.getByRole("button", {
        name: /close/i,
      });

      await act(async () => {
        closeButton.click();
      });
      const modal = screen.queryByRole("dialog");
      expect(modal).not.toBeInTheDocument();
    });

    it("cancel button closes modal", async () => {
      const store = createStoreWithMonthIndex(1);
      renderAssignComponent(store);

      await clickButtonAndWaitForModal(/assigned last month £1155\.98/i);
      await expectCategoryGroup(/bills/i);

      const cancelButton = screen.getByRole("button", {
        name: /cancel/i,
      });
      await act(async () => {
        cancelButton.click();
      });

      const modal = screen.queryByRole("dialog");
      expect(modal).not.toBeInTheDocument();
    });

    it("accept calls api", async () => {
      const store = createStoreWithMonthIndex(1);
      renderAssignComponent(store);

      await clickButtonAndWaitForModal(/assigned last month £1155\.98/i);
      const updateButton = screen.getByRole("button", {
        name: /update assigned amount/i,
      });
      await act(async () => {
        updateButton.click();
      });
      expect(patchMonthSpy).toHaveBeenCalled();
    });

    it("displays will not update message when no months to update", async () => {
      server.use(
        http.get(`${API_URL}/budget/category`, () => {
          return HttpResponse.json(assignedLastMonthAlreadyMatchedData);
        })
      );

      const store = createStoreWithMonthIndex(1);
      renderAssignComponent(store);

      await clickButtonAndWaitForModal(/assigned last month £1155\.98/i);
      await expectModalContent(
        /This will not update the assigned amount for any categories./i
      );
    });
  });
});
