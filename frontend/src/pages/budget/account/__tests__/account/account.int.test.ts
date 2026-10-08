import { setSnapshot } from "../__helpers__/msw/state";
import { renderAccountRedirectTest } from "../__helpers__/testUtils";
import { baseSnapshot } from "./account.snapshot";
import { screen } from "@testing-library/react";
import { setupTestServer } from "../__helpers__/msw/server";

setupTestServer();

describe("account", () => {
  it("redirects an invalid account ID to all accounts", async () => {
    setSnapshot(baseSnapshot);
    renderAccountRedirectTest();

    expect(
      await screen.findByText("All accounts destination")
    ).toBeInTheDocument();

    expect(screen.getByTestId("current-path")).toHaveTextContent(
      "/budget/account/all"
    );
  });
  it("redirects an invalid account ID to allocation when no accounts exist", async () => {
    setSnapshot({
      ...baseSnapshot,
      accounts: {},
    });

    renderAccountRedirectTest();

    expect(
      await screen.findByText("Allocation destination")
    ).toBeInTheDocument();

    expect(screen.getByTestId("current-path")).toHaveTextContent(
      "/budget/allocation"
    );
  });
});
