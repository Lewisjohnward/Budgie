import { fireEvent, render, screen } from "@testing-library/react";
import { AddAccountBtn } from "./AddAccountBtn";

describe("Add account button", () => {
  const renderComponent = () => {
    render(<AddAccountBtn />);
    return {
      button: screen.getByRole("button"),
      addIcon: screen.getByTestId("icon"),
    };
  };

  it("Renders", () => {
    const { button } = renderComponent();
    expect(button).toBeInTheDocument();
  });

  it("shows animation on hover", () => {
    const { addIcon } = renderComponent();
    fireEvent.mouseEnter(addIcon);
    expect(addIcon).toHaveClass("animate-shake");
  });

  it("opens the dialog when the button is clicked", () => {
    const { button } = renderComponent();
    fireEvent.click(button);
    expect(screen.getByTestId("add-account-dialog")).toBeInTheDocument();
  });

  it.todo("prevents closing the dialog if clicking outside", () => {
    // render(<AddAccountBtn />);
    // const triggerButton = screen.getByRole("button");
    // fireEvent.click(triggerButton); // Open the dialog
    // // fireEvent.mou
    // const dialogContent = screen.getByRole("dialog");
    // fireEvent.pointerDown(dialogContent); // Simulate clicking outside
    // screen.debug();
    // expect(dialogContent).toBeInTheDocument(); // The dialog should not close
  });

  it("has proper accessibility roles and labels", () => {
    const { button } = renderComponent();
    fireEvent.click(button);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });
});
