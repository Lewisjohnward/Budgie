import type { Meta, StoryObj } from "@storybook/react";
import { Category } from "@/core/types/NormalizedData";
import { SelectedCategories } from "./SelectedCategories";

const meta: Meta<typeof SelectedCategories> = {
  component: SelectedCategories,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-200 px-2 border-gray-200">
        <div className="w-96">
          <Story />
        </div>
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    categories: {
      description: "Array of selected categories to display",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockCategory1: Category = {
  id: "1",
  name: "Groceries",
  months: ["month1", "month2"],
  userId: "1",
  categoryGroupId: "1",
  position: 1,
};

const mockCategory2: Category = {
  id: "2",
  name: "Transportation",
  months: ["month1", "month2"],
  userId: "1",
  categoryGroupId: "1",
  position: 2,
};

const mockCategory3: Category = {
  id: "3",
  name: "Business Equipment, Software Licenses & Technology Infrastructure",
  months: ["month1", "month2"],
  userId: "1",
  categoryGroupId: "1",
  position: 3,
};

const mockCategory4: Category = {
  id: "4",
  name: "Utilities",
  months: ["month1", "month2"],
  userId: "1",
  categoryGroupId: "1",
  position: 4,
};

export const SingleCategory: Story = {
  args: {
    categories: [mockCategory1],
  },
};

export const SingleCategoryLongName: Story = {
  args: {
    categories: [mockCategory3],
  },
};

export const TwoCategories: Story = {
  args: {
    categories: [mockCategory1, mockCategory2],
  },
};

export const MultipleCategories: Story = {
  args: {
    categories: [mockCategory1, mockCategory2, mockCategory3, mockCategory4],
  },
};

export const EmptyCategories: Story = {
  args: {
    categories: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Edge case: Component handles empty categories array gracefully (should not occur in normal usage)",
      },
    },
  },
};
