import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import { setupTestServer, patchMonthSpy } from "./__helpers__/serverHandlers";
import {
  fundedData,
  fullyFundedData,
  multipleCategoryFundedData,
  fullyFundedDataRtaAvailable,
  fundedPositiveAvailable,
} from "./__helpers__/mockData";
import {
  renderAssignComponent,
  expectButtonAmount,
  clickButtonAndWaitForModal,
  expectModalContent,
  expectCategoryRow,
  createStoreWithSelectedCategories,
} from "./__helpers__/testUtils";
import { createStore } from "@/core/store/store";
import { addCategories } from "../slices/selectedCategorySlice";
import { act } from "react";

const API_URL = import.meta.env.VITE_API_URL;

describe("Assign - underfunded", () => {
  const server = setupTestServer();

  describe("button", () => {
    describe("no categories selected", () => {
      it("shows button when amount > 0", async () => {
        renderAssignComponent();
        await expectButtonAmount(/underfunded/i);
      });
      it("shows button when amount === 0", async () => {
        server.use(
          http.get(`${API_URL}/budget/category`, () => {
            return HttpResponse.json(fullyFundedData);
          })
        );
        renderAssignComponent();
        await expectButtonAmount(/underfunded/i);
      });
      it("shows button when amount < 0", async () => {
        server.use(
          http.get(`${API_URL}/budget/category`, () => {
            return HttpResponse.json(fundedPositiveAvailable);
          })
        );
        renderAssignComponent();
        await expectButtonAmount(/underfunded/i);
      });
    });
    describe("categories selected", () => {
      it("shows button when sum amount > 0", async () => {
        const store = createStoreWithSelectedCategories([
          {
            id: "c1",
            name: "Rent",
            categoryGroupId: "cg1",
            months: ["m1", "m2"],
            userId: "user1",
            position: 0,
          },
          {
            id: "c2",
            name: "Groceries",
            categoryGroupId: "cg1",
            months: ["m3", "m4"],
            userId: "user1",
            position: 1,
          },
        ]);

        renderAssignComponent(store);
        await expectButtonAmount(/underfunded/i);
      });

      it("calls PATCH endpoint when button clicked with selected categories", async () => {
        const store = createStoreWithSelectedCategories([
          {
            id: "c1",
            name: "Rent",
            categoryGroupId: "cg1",
            months: ["m1", "m2"],
            userId: "user1",
            position: 0,
          },
          {
            id: "c2",
            name: "Groceries",
            categoryGroupId: "cg1",
            months: ["m3", "m4"],
            userId: "user1",
            position: 1,
          },
        ]);

        renderAssignComponent(store);
        const underfundedButton = await expectButtonAmount(/underfunded/i);

        await act(async () => {
          underfundedButton.click();
        });

        // Wait for the PATCH request to be made
        await waitFor(() => {
          expect(patchMonthSpy).toHaveBeenCalled();
        });

        // console.log(patchMonthSpy.mock.calls)
        // Optionally, check the payload sent to the API
        // expect(patchMonthSpy).toHaveBeenCalledWith(
        //   expect.arrayContaining([
        //     expect.objectContaining({
        //       id: expect.any(String),
        //       assigned: expect.any(Number),
        //     }),
        //   ])
        // );
      });

      it("hides button when amount === 0", async () => {
        server.use(
          http.get(`${API_URL}/budget/category`, () => {
            return HttpResponse.json(fullyFundedData);
          })
        );
        const store = createStore();
        store.dispatch(
          addCategories([
            {
              id: "c1",
              name: "Rent",
              categoryGroupId: "cg1",
              months: ["m1", "m2"],
              userId: "user1",
              position: 0,
            },
            {
              id: "c2",
              name: "Groceries",
              categoryGroupId: "cg1",
              months: ["m3", "m4"],
              userId: "user1",
              position: 1,
            },
          ])
        );
        renderAssignComponent(store);
        await waitFor(() => {
          expect(screen.getByText("Rent, Groceries")).toBeInTheDocument();
        });

        const underfundedButton = screen.queryByRole("button", {
          name: /underfunded/i,
        });
        expect(underfundedButton).not.toBeInTheDocument();
      });

      it("hides button when amount < 0", async () => {
        server.use(
          http.get(`${API_URL}/budget/category`, () => {
            return HttpResponse.json(fundedPositiveAvailable);
          })
        );
        const store = createStore();
        store.dispatch(
          addCategories([
            {
              id: "c1",
              name: "Rent",
              categoryGroupId: "cg1",
              months: ["m1", "m2"],
              userId: "user1",
              position: 0,
            },
            {
              id: "c2",
              name: "Groceries",
              categoryGroupId: "cg1",
              months: ["m3", "m4"],
              userId: "user1",
              position: 1,
            },
          ])
        );
        renderAssignComponent(store);
        await waitFor(() => {
          expect(screen.getByText("Rent, Groceries")).toBeInTheDocument();
        });

        const underfundedButton = screen.queryByRole("button", {
          name: /underfunded/i,
        });
        expect(underfundedButton).not.toBeInTheDocument();
      });
    });
  });

  describe("modal - on button press", () => {
    it("doesn't display when categories selected", async () => {
      const store = createStoreWithSelectedCategories([
        {
          id: "c1",
          name: "Rent",
          categoryGroupId: "cg1",
          months: ["m1", "m2"],
          userId: "user1",
          position: 0,
        },
        {
          id: "c2",
          name: "Groceries",
          categoryGroupId: "cg1",
          months: ["m3", "m4"],
          userId: "user1",
          position: 1,
        },
      ]);

      renderAssignComponent(store);
      await waitFor(() => {
        expect(screen.getByText("Rent, Groceries")).toBeInTheDocument();
      });

      const underfundedButton = await screen.findByRole("button", {
        name: /underfunded/i,
      });
      expect(underfundedButton).toBeInTheDocument();
      await act(async () => {
        underfundedButton.click();
      });
      const modal = screen.queryByRole("dialog");
      expect(modal).not.toBeInTheDocument();
    });

    it("partial funding", async () => {
      server.use(
        http.get(`${API_URL}/budget/category`, () => {
          return HttpResponse.json(fundedData);
        })
      );
      renderAssignComponent();

      await clickButtonAndWaitForModal(/Underfunded £1200\.00/i);

      const partialFundingText = await screen.findByText(/partially funded/i);
      const parentParagraph = partialFundingText.closest("p");
      expect(parentParagraph).toHaveTextContent(
        "You don't have enough money to fully fund all of your categories. 1 category will be partially funded"
      );

      await expectCategoryRow("Rent", "+£700.00");

      await waitFor(() => {
        const cancelButton = screen.getByRole("button", {
          name: /cancel/i,
        });
        expect(cancelButton).toBeInTheDocument();

        const assignButton = screen.getByRole("button", {
          name: /assign money/i,
        });
        expect(assignButton).toBeInTheDocument();
      });
    });

    it("multiple categories funded", async () => {
      server.use(
        http.get(`${API_URL}/budget/category`, () => {
          return HttpResponse.json(multipleCategoryFundedData);
        })
      );
      renderAssignComponent();

      await clickButtonAndWaitForModal(/Underfunded £1700\.00/i);

      const partialFundingText = await screen.findByText(/fully funded/i);
      const parentParagraph = partialFundingText.closest("p");
      expect(parentParagraph).toHaveTextContent(
        "2 categories will be fully funded"
      );

      await expectCategoryRow("Rent", "+£1200.00");
      await expectCategoryRow("Groceries", "+£500.00");

      await waitFor(() => {
        const cancelButton = screen.getByRole("button", {
          name: /cancel/i,
        });
        expect(cancelButton).toBeInTheDocument();

        const assignButton = screen.getByRole("button", {
          name: /assign money/i,
        });
        expect(assignButton).toBeInTheDocument();
      });
    });

    describe("no money to assign, rta available === 0", () => {
      beforeEach(() => {
        server.use(
          http.get(`${API_URL}/budget/category`, () => {
            return HttpResponse.json(fullyFundedData);
          })
        );
      });

      it("renders modal correctly", async () => {
        renderAssignComponent();

        await expectButtonAmount(/underfunded/i);
        await clickButtonAndWaitForModal(/underfunded/i);
        await expectModalContent(/you assigned all of your money already/i);

        await waitFor(() => {
          const okButton = screen.getByRole("button", {
            name: /ok/i,
          });
          expect(okButton).toBeInTheDocument();
        });
      });
    });

    describe("fully funded, money left over, sum of available === 0 and rta available === 0", () => {
      beforeEach(() => {
        server.use(
          http.get(`${API_URL}/budget/category`, () => {
            return HttpResponse.json(fullyFundedDataRtaAvailable);
          })
        );
      });
      it("renders modal correctly", async () => {
        renderAssignComponent();

        await waitFor(() => {
          expect(screen.getByText("August's Balance")).toBeInTheDocument();
          expect(screen.getByText("£1700.00")).toBeInTheDocument();
        });

        await expectButtonAmount(/underfunded/i);
        await clickButtonAndWaitForModal(/underfunded/i);
        await expectModalContent(/You have already fully funded this month/i);

        await waitFor(() => {
          const nextMonthButton = screen.getByRole("button", {
            name: /go to next month/i,
          });
          expect(nextMonthButton).toBeInTheDocument();

          const okButton = screen.getByRole("button", {
            name: /ok/i,
          });
          expect(okButton).toBeInTheDocument();
        });
      });
    });
  });
});
