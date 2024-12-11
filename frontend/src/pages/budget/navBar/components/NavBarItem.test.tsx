import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { NavbarItem } from "./NavBarItem";

describe("MenuButton Component", () => {
  const defaultProps = {
    to: "/some-path",
    selected: false,
    icon: <div data-testid="icon" />,
    text: "Item text",
    displayText: true,
  };

  const renderComponent = (props = {}) => {
    render(<NavbarItem {...defaultProps} {...props} />, {
      wrapper: BrowserRouter,
    });
    return {
      link: screen.getByRole("link"),
      linkText: screen.queryByTestId("link-text"),
      iconContainer: screen.getByTestId("icon-container"),
    };
  };

  it("Renders component", () => {
    const { link } = renderComponent();
    expect(link).toBeInTheDocument();
  });

  it("Renders the link text and when displayText is true", () => {
    const { linkText } = renderComponent();
    expect(linkText).toBeInTheDocument();
  });

  it("Does not render the link text when displayText is false", () => {
    const { linkText } = renderComponent({ displayText: false });
    expect(linkText).not.toBeInTheDocument();
  });

  it("Applies the hover animation class when mouse is over and selected is false", () => {
    const { iconContainer } = renderComponent({ selected: false });

    fireEvent.mouseEnter(iconContainer);

    expect(iconContainer).toHaveClass("animate-shake");
  });

  it("Does not apply the hover animation class when selected is true", () => {
    const { iconContainer } = renderComponent({ selected: true });

    fireEvent.mouseEnter(iconContainer);

    expect(iconContainer).not.toHaveClass("animate-shake");
  });

  it("navigates to the correct `to` path when clicked", () => {
    renderComponent();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/some-path");
  });

  it("applies custom className passed via props", () => {
    const customClass = "custom-class";
    renderComponent({ className: customClass });

    const link = screen.getByRole("link");
    expect(link).toHaveClass(customClass);
  });
});
