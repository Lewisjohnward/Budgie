import type { Meta, StoryObj } from "@storybook/react";
import { SelectPayee } from "./SelectPayee";
import { SelectPayeeModel } from "./useSelectPayee";

const meta: Meta<typeof SelectPayee> = {
  component: SelectPayee,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="flex justify-center items-center bg-gray-200 w-[400px] h-[100px] p-2 border border-gray-200">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const noAccountsNoPayees: SelectPayeeModel = {
  input: {
    value: "",
    onChange: () => {},
    status: "idle",
    isIdle: true,
    isFiltering: false,
    isNoMatch: false,
    isExactMatch: false,
  },
  filteredPayees: [],
  filteredAccounts: [],
  select: () => {},
  openManagePayeesDialog: () => {},
  popover: {
    isOpen: false,
    open: () => {},
    close: () => {},
  },
};

export const noAccountsOrPayeesStory: Story = {
  args: { selectPayee: noAccountsNoPayees },
};

const accountsAndPayees: SelectPayeeModel = {
  input: {
    value: "",
    onChange: () => {},
    status: "idle",
    isIdle: true,
    isFiltering: false,
    isNoMatch: false,
    isExactMatch: false,
  },
  filteredPayees: [
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
  ],
  filteredAccounts: [
    {
      name: "account 1",
    },
    {
      name: "account 2",
    },
  ],
  select: () => {},
  openManagePayeesDialog: () => {},
  popover: {
    isOpen: true,
    open: () => {},
    close: () => {},
  },
};

export const accountsAndPayeesStory: Story = {
  args: { selectPayee: accountsAndPayees },
};

const accountsAndPayeesWithNoMatch: SelectPayeeModel = {
  input: {
    value: "new payee",
    onChange: () => {},
    status: "filtering",
    isIdle: false,
    isFiltering: true,
    isNoMatch: false,
    isExactMatch: false,
  },
  filteredPayees: [
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
  ],
  filteredAccounts: [
    {
      name: "account 1",
    },
    {
      name: "account 2",
    },
  ],
  select: () => {},
  openManagePayeesDialog: () => {},
  popover: {
    isOpen: true,
    open: () => {},
    close: () => {},
  },
};

export const accountsAndPayeesWithNoMatchStory: Story = {
  args: { selectPayee: accountsAndPayeesWithNoMatch },
};

const noMatch: SelectPayeeModel = {
  input: {
    value: "new payee",
    onChange: () => {},
    status: "noMatch",
    isIdle: false,
    isFiltering: false,
    isNoMatch: true,
    isExactMatch: false,
  },
  filteredPayees: [],
  filteredAccounts: [],
  select: () => {},
  openManagePayeesDialog: () => {},
  popover: {
    isOpen: true,
    open: () => {},
    close: () => {},
  },
};

export const noMatchStory: Story = {
  args: { selectPayee: noMatch },
};

const lotsOfAccounts: SelectPayeeModel = {
  input: {
    value: "new payee",
    onChange: () => {},
    status: "filtering",
    isIdle: false,
    isFiltering: true,
    isNoMatch: false,
    isExactMatch: false,
  },
  filteredPayees: [
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
  ],
  filteredAccounts: [
    {
      name: "account 1",
    },
  ],
  select: () => {},
  openManagePayeesDialog: () => {},
  popover: {
    isOpen: true,
    open: () => {},
    close: () => {},
  },
};

export const lotsOfAccountsStory: Story = {
  args: { selectPayee: lotsOfAccounts },
};

const lotsOfAccountsWithAdd: SelectPayeeModel = {
  input: {
    value: "new payee",
    onChange: () => {},
    status: "noMatch",
    isIdle: false,
    isFiltering: false,
    isNoMatch: true,
    isExactMatch: false,
  },
  filteredPayees: [
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
    {
      name: "payee 1",
    },
    {
      name: "payee 2",
    },
  ],
  filteredAccounts: [
    {
      name: "account 1",
    },
  ],
  select: () => {},
  openManagePayeesDialog: () => {},
  popover: {
    isOpen: true,
    open: () => {},
    close: () => {},
  },
};

export const lotsOfAccountsWithAddStory: Story = {
  args: { selectPayee: lotsOfAccountsWithAdd },
};
