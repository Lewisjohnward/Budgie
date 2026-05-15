import type { Meta, StoryObj } from "@storybook/react";
import { ReadyToAssign, ReadyToAssignProps } from "./ReadyToAssign";

const mockReadyToAssignProps: ReadyToAssignProps = {
  currency: "£",
  rtaInformation: {
    assignableleftOverFromLastMonth: 0,
    assignableCurrentMonth: 0,
    totalAssignedCurrentMonth: 0,
    totalAssignedFuture: 0,
    available: 0,
  },
};

const meta: Meta<typeof ReadyToAssign> = {
  component: ReadyToAssign,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="flex justify-center items-start bg-transparent w-[400px] h-[400px] p-2 border border-gray-200">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadyToAssignStory: Story = {
  args: mockReadyToAssignProps,
};
