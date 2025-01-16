import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AddAccountForm } from "./AddAccountForm";
import { useAddAccountMutation } from "@/core/api/budgetApiSlice";
import { Provider } from "react-redux";
import { store } from "@/core/store/store";

vi.mock("@/core/api/budgetApiSlice", () => ({
  useAddAccountMutation: vi.fn(),
}));
const addAccountMock = vi.fn();
useAddAccountMutation.mockReturnValue([addAccountMock]);

describe("Add Account Form", () => {
  const renderComponent = () => {
    render(
      <Provider store={store}>
        <AddAccountForm />
      </Provider>,
    );

    return {
      nextButton: screen.getByRole("button", { name: /next/i }),
      nameInput: screen.getByLabelText("Give it a nickname"),
      balanceInput: screen.getByLabelText(
        "What is your current account balance?",
      ),
      selectAccountButton: screen.getByTestId("select-account-type"),
    };
  };

  it("Render", () => {
    const { nextButton } = renderComponent();
    expect(nextButton).toBeInTheDocument();
  });

  it("Initial state: nextButton disabled", () => {
    const { nextButton } = renderComponent();

    expect(nextButton).not.toBeEnabled();
  });

  it("Initial state: no icons visible", () => {
    renderComponent();

    const icons = screen.queryByLabelText(/tick icon/i);

    expect(icons).not.toBeInTheDocument();
  });

  it("Should display tick icon when name entered", async () => {
    const { nameInput } = renderComponent();
    fireEvent.change(nameInput, { target: { value: "test name" } });

    const icon = await screen.findByLabelText(/tick icon/i);

    expect(nameInput).toHaveValue("test name");

    expect(icon).toBeInTheDocument();
  });

  it("Should display account type menu when pressing type of account", () => {
    const { selectAccountButton } = renderComponent();

    fireEvent.click(selectAccountButton);

    const title = screen.getByRole("heading", { level: 1 });

    expect(title).toHaveTextContent(/select account type/i);
  });

  it("Should display a tick when valid balance entered", async () => {
    const { balanceInput } = renderComponent();

    fireEvent.change(balanceInput, { target: { value: "65" } });
    expect(balanceInput).toHaveValue("65");

    const icon = await screen.findByLabelText(/tick icon/i);

    expect(icon).toBeInTheDocument();
  });

  it("Should display tick icon when name and balance valid", () => {
    const { balanceInput, nameInput } = renderComponent();

    fireEvent.change(nameInput, { target: { value: "test name" } });
    fireEvent.change(balanceInput, { target: { value: "65" } });
  });

  it.todo(
    "Should display question mark icon when name balance is not a number",
    () => {},
  );

  it("NextButton should be enabled when name, type and balance are entered", async () => {
    const { balanceInput, selectAccountButton, nameInput } = renderComponent();
    fireEvent.change(nameInput, { target: { value: "test name" } });
    fireEvent.change(balanceInput, { target: { value: "65" } });
    fireEvent.click(selectAccountButton);
    const addBankAccountButton = screen.getByLabelText(/bank account/i);
    fireEvent.click(addBankAccountButton);
    const tickIcons = await screen.findAllByLabelText(/tick icon/i);
    const nextButton = screen.getByRole("button", { name: /next/i });

    expect(tickIcons.length).toBe(3);
    expect(nextButton).toBeEnabled();
  });

  it("Should call add account function with params", async () => {
    const { balanceInput, selectAccountButton, nameInput } = renderComponent();

    fireEvent.change(nameInput, { target: { value: "test name" } });
    fireEvent.change(balanceInput, { target: { value: "65" } });
    fireEvent.click(selectAccountButton);
    const addBankAccountButton = screen.getByLabelText(/bank account/i);
    fireEvent.click(addBankAccountButton);
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(addAccountMock).toHaveBeenCalledOnce();
      expect(addAccountMock).toHaveBeenCalledWith({
        name: "test name",
        balance: 65,
        accountType: "Bank Account",
      });
    });
  });
});
