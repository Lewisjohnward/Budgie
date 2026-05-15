import type { Meta, StoryObj } from "@storybook/react";
import { Note } from "./Note";

const meta: Meta<typeof Note> = {
  component: Note,
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
