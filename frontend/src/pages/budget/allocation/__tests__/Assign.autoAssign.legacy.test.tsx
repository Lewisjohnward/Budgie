import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderAssignComponent } from "./__helpers__/testUtils";

describe("auto-assign", () => {
  it.only("renders correctly in open state", () => {
    renderAssignComponent();
    const autoAssignButton = screen.getByRole("button", {
      name: /auto-assign/i,
    });
    expect(autoAssignButton).toBeInTheDocument();
    expect(autoAssignButton).toHaveAttribute("aria-expanded", "true");
  });
});
