import type { Meta, StoryObj } from "@storybook/react";
import { TransactionDateFilter } from "./TransactionDateFilter";

const meta: Meta<typeof TransactionDateFilter> = {
  component: TransactionDateFilter,
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TransactionDateFilterStory: Story = {
  args: {},
};
