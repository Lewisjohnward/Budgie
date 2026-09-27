import { setupTestServer } from "./__helpers__/serverHandlers";
import userEvent from "@testing-library/user-event";
import { renderAccountPage } from "./__helpers__/testUtils";
import { screen } from "@testing-library/react";

const findFilterInput = () => {
  return screen.findByRole("textbox", {
    name: /search transactions/i,
  });
};

describe("Account - table - filter", () => {
  setupTestServer();
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(async () => {
    user = userEvent.setup();
    renderAccountPage();
  });
  it("should hide filter popover when input loses focus", async () => {
    const filterInput = await findFilterInput();

    await user.type(filterInput, "test");

    expect(await screen.findByText(/in any/i)).toBeInTheDocument();
    expect(await screen.findByText(/in payee/i)).toBeInTheDocument();

    await user.tab();

    expect(screen.queryByText(/in any/i)).not.toBeInTheDocument();
  });
});
