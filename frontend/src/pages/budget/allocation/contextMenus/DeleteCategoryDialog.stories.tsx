import type { Meta, StoryObj } from "@storybook/react";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";

const meta: Meta<typeof DeleteCategoryDialog> = {
  component: DeleteCategoryDialog,
  parameters: {
    layout: "centered",
  },
  decorators: [(Story) => <Story />],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DeleteCategoryDialogStory: Story = {
  args: {
    open: true,
    toggle: () => {},
    categoryName: "🍂 Autumn Clothes",
    transactionCount: 10,
  },
};
