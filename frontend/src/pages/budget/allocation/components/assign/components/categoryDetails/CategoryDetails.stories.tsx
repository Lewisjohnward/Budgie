import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CategoryDetails } from "./CategoryDetails";
import { Category } from "@/core/types/NormalizedData";

const meta: Meta<typeof CategoryDetails> = {
  component: CategoryDetails,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-50 w-96 border border-gray-200">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Define the story args type to match the loaded state of UseSelectedCategories
type StoryArgs = {
  selectedCategories: Category[];
  categoryTotals: {
    available: number;
    leftover: number;
    assigned: number;
    spending: number;
    futureCredit: number;
  };
  monthTotals: {
    leftover: number;
    assigned: number;
    spending: number;
    available: number;
  };
  open: boolean;
  currentMonthName: string;
  toggleOpen?: () => void;
};

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

const InteractiveTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(args.open || true);

  return (
    <CategoryDetails
      {...args}
      open={isOpen}
      toggleOpen={() => setIsOpen(!isOpen)}
    />
  );
};

export const MonthViewClosed: Story = {
  render: InteractiveTemplate,
  args: {
    selectedCategories: [],
    categoryTotals: {
      available: 1500.75,
      leftover: 500.25,
      assigned: 1200.5,
      spending: -200.0,
      futureCredit: 0,
    },
    monthTotals: {
      leftover: 500.25,
      assigned: 1200.5,
      spending: -200.0,
      available: 1500.75,
    },
    open: false,
    currentMonthName: "January",
  },
};

export const MonthViewOpen: Story = {
  render: InteractiveTemplate,
  args: {
    selectedCategories: [],
    categoryTotals: {
      available: 1500.75,
      leftover: 500.25,
      assigned: 1200.5,
      spending: -200.0,
      futureCredit: 0,
    },
    monthTotals: {
      leftover: 500.25,
      assigned: 1200.5,
      spending: -200.0,
      available: 1500.75,
    },
    open: true,
    currentMonthName: "January",
  },
};

export const CategoriesSelectedClosed: Story = {
  render: InteractiveTemplate,
  args: {
    selectedCategories: [mockCategory1, mockCategory2],
    categoryTotals: {
      available: 750.25,
      leftover: 200.5,
      assigned: 600.75,
      spending: -51.0,
      futureCredit: 0,
    },
    monthTotals: {
      leftover: 500.25,
      assigned: 1200.5,
      spending: -200.0,
      available: 1500.75,
    },
    open: false,
    currentMonthName: "February",
  },
};

export const CategoriesSelectedOpen: Story = {
  render: InteractiveTemplate,
  args: {
    selectedCategories: [mockCategory1, mockCategory2],
    categoryTotals: {
      available: 750.25,
      leftover: 200.5,
      assigned: 600.75,
      spending: -51.0,
      futureCredit: 0,
    },
    monthTotals: {
      leftover: 500.25,
      assigned: 1200.5,
      spending: -200.0,
      available: 1500.75,
    },
    open: true,
    currentMonthName: "February",
  },
};

export const OverspentCategories: Story = {
  render: InteractiveTemplate,
  args: {
    selectedCategories: [mockCategory1, mockCategory2],
    categoryTotals: {
      available: -125.5,
      leftover: 100.0,
      assigned: 300.0,
      spending: -525.5,
      futureCredit: 0,
    },
    monthTotals: {
      leftover: 500.25,
      assigned: 1200.5,
      spending: -200.0,
      available: 1500.75,
    },
    open: true,
    currentMonthName: "March",
  },
};

export const ZeroBalance: Story = {
  render: InteractiveTemplate,
  args: {
    selectedCategories: [mockCategory1],
    categoryTotals: {
      available: 0,
      leftover: 150.0,
      assigned: 200.0,
      spending: -350.0,
      futureCredit: 0,
    },
    monthTotals: {
      leftover: 500.25,
      assigned: 1200.5,
      spending: -200.0,
      available: 1500.75,
    },
    open: true,
    currentMonthName: "April",
  },
};
