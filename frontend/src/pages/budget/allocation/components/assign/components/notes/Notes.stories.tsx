import type { Meta, StoryObj } from "@storybook/react";
import { Notes } from "./Notes";

const meta: Meta<typeof Notes> = {
  component: Notes,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (story) => (
      <div className="bg-gray-200 w-96 p-2 border border-gray-200">
        {story()}
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
