import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AutoAssign } from "./AutoAssign";
import { FundingOption } from "../../hooks/useAutoAssign";

const meta: Meta<typeof AutoAssign> = {
  component: AutoAssign,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-200 w-96 p-2 border border-gray-200">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockData = {
  assign: {
    handler: (action: FundingOption) => console.log(`${action} clicked`),
    amount: (action: FundingOption) => {
      const amounts: Record<FundingOption, number> = {
        [FundingOption.UNDERFUNDED]: 250.75,
        [FundingOption.ASSIGN_LAST_MONTH]: 1200.5,
        [FundingOption.SPENT_LAST_MONTH]: 980.25,
        [FundingOption.AVERAGE_ASSIGNED]: 1100.0,
        [FundingOption.AVERAGE_SPENT]: 950.75,
        [FundingOption.RESET_ASSIGNED]: 0,
        [FundingOption.RESET_AVAILABLE]: 0,
      };
      return amounts[action] || 0;
    },
    display: true,
  },
  ui: {
    open: true,
    toggleOpen: () => console.log("Toggle clicked"),
  },
};

const InteractiveTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.ui?.open || true);

  return (
    <AutoAssign
      {...args}
      ui={{
        ...args.ui,
        open: isOpen,
        toggleOpen: () => setIsOpen(!isOpen),
      }}
    />
  );
};

export const Open: Story = {
  render: InteractiveTemplate,
  args: {
    ...mockData,
  },
};

export const WithLargeAmounts: Story = {
  render: InteractiveTemplate,
  args: {
    ...mockData,
    assign: {
      ...mockData.assign,
      amount: (action: FundingOption) => {
        const amounts: Record<FundingOption, number> = {
          [FundingOption.UNDERFUNDED]: 15750.99,
          [FundingOption.ASSIGN_LAST_MONTH]: 25000.0,
          [FundingOption.SPENT_LAST_MONTH]: 18500.75,
          [FundingOption.AVERAGE_ASSIGNED]: 22000.5,
          [FundingOption.AVERAGE_SPENT]: 19750.25,
          [FundingOption.RESET_ASSIGNED]: 0,
          [FundingOption.RESET_AVAILABLE]: 0,
        };
        return amounts[action] || 0;
      },
    },
  },
};

export const WithNegativeAmounts: Story = {
  render: InteractiveTemplate,
  args: {
    ...mockData,
    assign: {
      ...mockData.assign,
      amount: (action: FundingOption) => {
        const amounts: Record<FundingOption, number> = {
          [FundingOption.UNDERFUNDED]: -150.5,
          [FundingOption.ASSIGN_LAST_MONTH]: 500.0,
          [FundingOption.SPENT_LAST_MONTH]: -750.25,
          [FundingOption.AVERAGE_ASSIGNED]: 400.75,
          [FundingOption.AVERAGE_SPENT]: -200.5,
          [FundingOption.RESET_ASSIGNED]: 0,
          [FundingOption.RESET_AVAILABLE]: 0,
        };
        return amounts[action] || 0;
      },
    },
  },
};

export const WithZeroAmounts: Story = {
  render: InteractiveTemplate,
  args: {
    ...mockData,
    assign: {
      ...mockData.assign,
      amount: (_action: FundingOption) => 0,
    },
  },
};

export const UnderfundedHidden: Story = {
  render: InteractiveTemplate,
  args: {
    ...mockData,
    assign: {
      ...mockData.assign,
      display: false,
    },
  },
};
