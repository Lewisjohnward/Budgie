import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupTestServer } from "./__helpers__/serverHandlers";
import { renderAllocationPage } from "./__helpers__/testUtils";

// left over last month is a sum of the previous month +ve available
describe("Assign - Selected Categories", () => {
  setupTestServer();

  beforeEach(() => {
    vi.setSystemTime(new Date("2025-08-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render correctly in open state", async () => {
    renderAllocationPage();
    await waitFor(() => {
      const categoryDetailsButton = screen.getByRole("button", {
        name: /August's Balance/i,
      });

      expect(categoryDetailsButton).toBeInTheDocument();
      expect(categoryDetailsButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("When no category is selected", async () => {
    it("should render the correct month balance details", async () => {
      renderAllocationPage();

      await waitFor(() => {
        const assignedRow = screen
          .getByText("Assigned in August")
          .closest("div");
        expect(assignedRow).toHaveTextContent("£500.00");
      });

      expect(await screen.findByText(/August's Balance/i)).toBeInTheDocument();

      const leftoverRow = screen
        .getByText("Left Over from Last Month")
        .closest("div");
      expect(leftoverRow).toHaveTextContent("£0.00");

      const activityRow = screen.getByText("Activity").closest("div");
      expect(activityRow).toHaveTextContent("-£1250.00");

      const availableRow = screen.getByText("Available").closest("div");
      expect(availableRow).toHaveTextContent("-£750.00");
    });
    it("should render the correct month balance details month[1]", async () => {
      // Mock September 2025 to match monthIndex 1
      vi.setSystemTime(new Date("2025-09-15T12:00:00.000Z"));

      renderAllocationPage();

      await waitFor(() => {
        const assignedRow = screen
          .getByText("Assigned in September")
          .closest("div");
        expect(assignedRow).toHaveTextContent("£0.00");
      });

      expect(
        await screen.findByText(/September's Balance/i)
      ).toBeInTheDocument();

      const leftoverRow = screen
        .getByText("Left Over from Last Month")
        .closest("div");
      expect(leftoverRow).toHaveTextContent("£500.00");

      const activityRow = screen.getByText("Activity").closest("div");
      expect(activityRow).toHaveTextContent("£0.00");

      const availableRow = screen.getByText("Available").closest("div");
      expect(availableRow).toHaveTextContent("£500.00");
    });
  });

  describe("when a single category is selected", () => {
    it("should render the correct month balance details", async () => {
      const user = userEvent.setup();
      renderAllocationPage();

      // Find and click the Rent category
      const rentText = await screen.findByText("Rent");
      await user.click(rentText);

      const leftoverRow = screen
        .getByText("Cash Left Over from Last Month")
        .closest("div");
      expect(leftoverRow).toHaveTextContent("£0.00");

      const assignedRow = screen
        .getByText("Assigned this month")
        .closest("div");
      expect(assignedRow).toHaveTextContent("£0.00");

      const cashSpendingRow = screen.getByText("Cash Spending").closest("div");
      expect(cashSpendingRow).toHaveTextContent("-£1200.00");

      const container = screen
        .getByText(/you've overspent this category/i)
        .closest("div");
      expect(container).toHaveTextContent(
        /you've overspent this category by £1200.00/i
      );
    });
  });

  describe("when a multiple categories are selected", () => {
    it("should render the correct month balance details", async () => {
      const user = userEvent.setup();
      renderAllocationPage();

      // Find and click the Rent category
      const rentText = await screen.findByText("Rent");
      await user.click(rentText);

      // Find and click the Groceries category while holding Ctrl to multi-select
      const groceriesText = await screen.findByText("Groceries");
      await user.keyboard("{Control>}");
      await user.click(groceriesText);
      await user.keyboard("{/Control}");

      await waitFor(() => {
        const assignedRow = screen
          .getByText("Assigned in August")
          .closest("div");
        expect(assignedRow).toHaveTextContent("£500.00");
      });

      expect(await screen.findByText(/August's Balance/i)).toBeInTheDocument();

      const leftoverRow = screen
        .getByText("Left Over from Last Month")
        .closest("div");
      expect(leftoverRow).toHaveTextContent("£0.00");

      const activityRow = screen.getByText("Activity").closest("div");
      expect(activityRow).toHaveTextContent("-£1250.00");

      const availableRow = screen.getByText("Available").closest("div");
      expect(availableRow).toHaveTextContent("-£750.00");
    });
  });
});
