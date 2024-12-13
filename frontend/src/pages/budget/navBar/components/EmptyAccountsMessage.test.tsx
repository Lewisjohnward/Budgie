import { render } from "@testing-library/react";
import { EmptyAccountsMessage } from "./EmptyAccountsMessage";

describe("Empty accounts message", () => {
  it("Message renders correctly", () => {
    const { asFragment } = render(<EmptyAccountsMessage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
