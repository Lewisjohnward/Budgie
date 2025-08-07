import { describe, it } from "vitest";
import { setupTestServer } from "./__helpers__/serverHandlers";
import { renderAssignComponent } from "./__helpers__/testUtils";
import { screen } from "@testing-library/react";
import { act } from "react";
import userEvent from "@testing-library/user-event";

describe("Assign - Notes", () => {
  setupTestServer();

  it("renders the notes component correctly in open state", async () => {
    renderAssignComponent();
    const notesButton = screen.getByRole("button", {
      name: /notes/i,
    });
    expect(notesButton).toBeInTheDocument();
    expect(notesButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("toggles the notes component open/close", async () => {
    renderAssignComponent();
    const notesButton = screen.getByRole("button", {
      name: /notes/i,
    });

    await act(async () => {
      notesButton.click();
    });

    expect(notesButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("updates the notes when the text changes", async () => {
    const user = userEvent.setup();
    renderAssignComponent();

    const textbox = screen.getByRole("textbox");

    await user.clear(textbox);
    await user.type(textbox, "test");

    expect((textbox as HTMLTextAreaElement).value).toBe("test");
  });

  it("placeholder text displayed when text is empty", async () => {
    renderAssignComponent();

    const textbox = screen.getByRole("textbox");

    expect((textbox as HTMLTextAreaElement).value).toBe("");
    expect(textbox).toHaveAttribute(
      "placeholder",
      "Something to remember this month?"
    );
  });

  it("shows all content without scrolling when text is long", async () => {
    const user = userEvent.setup();
    renderAssignComponent();

    const textbox = screen.getByRole("textbox") as HTMLTextAreaElement;

    await user.type(
      textbox,
      "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8"
    );

    // scrollHeight should equal clientHeight (no scrolling needed)
    expect(textbox.scrollHeight).toBe(textbox.clientHeight);
  });
  it.todo("calls the api when the text changes");
  it.todo("displays note from the api");
});
