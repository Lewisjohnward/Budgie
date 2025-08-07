import type { Meta, StoryObj } from "@storybook/react";
import { AssignView } from "./AssignView";
import { SelectedCategoriesState } from "../hooks/useSelectedCategories";
import { Category } from "@/core/types/NormalizedData";
import { useState } from "react";
import { AutoAssignState } from "../hooks/useAutoAssign";
import { NotesState } from "../hooks/useNotes";

const meta: Meta<typeof AssignView> = {
  component: AssignView,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-200 w-96 h-[1000px] p-4">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: "1",
  name: "Groceries",
  userId: "1",
  categoryGroupId: "1",
  months: [],
  position: 0,
  ...overrides,
});

const createMockSelectedCategories = (
  overrides: Partial<
    Omit<SelectedCategoriesState, "isLoading" | "allCategories">
  > = {}
): Omit<SelectedCategoriesState, "isLoading" | "allCategories"> => ({
  selectedCategories: [],
  categoryTotals: {
    available: 0,
    leftover: 0,
    assigned: 0,
    spending: 0,
    futureCredit: 0,
  },
  monthTotals: {
    leftover: 0,
    assigned: 0,
    spending: 0,
    available: 0,
  },
  currentMonthName: "January",
  open: true,
  toggleOpen: () => {},
  ...overrides,
});

const createMockAutoAssign = (
  overrides: Partial<AutoAssignState> = {}
): AutoAssignState => ({
  assign: {
    amount: () => 0,
    display: true,
    handler: () => {},
  },
  modal: {
    open: false,
    toggleOpen: () => {},
    fundingState: null,
    onConfirm: () => {},
    onClose: () => {},
    onNextMonth: () => {},
  },
  ui: {
    open: true,
    toggleOpen: () => {},
  },
  ...overrides,
});

const createMockNotes = (overrides: Partial<NotesState> = {}): NotesState => ({
  notes: {
    text: "",
    setText: () => {},
  },
  ui: {
    open: true,
    toggle: () => {},
  },
  ...overrides,
});

const InteractiveAssignView = (args: any) => {
  const [categoryDetailsOpen, setCategoryDetailsOpen] = useState(true);
  const [autoAssignOpen, setAutoAssignOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(true);
  const [notesText, setNotesText] = useState("");

  const selectedCategories: Omit<
    SelectedCategoriesState,
    "isLoading" | "allCategories"
  > = {
    ...args.selectedCategories,
    open: categoryDetailsOpen,
    toggleOpen: () => {
      setCategoryDetailsOpen(!categoryDetailsOpen);
    },
  };

  const autoAssign: AutoAssignState = {
    ...args.autoAssign,
    ui: {
      ...args.autoAssign.ui,
      open: autoAssignOpen,
      toggleOpen: () => {
        setAutoAssignOpen(!autoAssignOpen);
      },
    },
  };

  const notes: NotesState = {
    ...args.notes,
    notes: {
      text: notesText,
      setText: setNotesText,
    },
    ui: {
      open: notesOpen,
      toggle: () => setNotesOpen(!notesOpen),
    },
  };

  return (
    <AssignView
      selectedCategories={selectedCategories}
      autoAssign={autoAssign}
      notes={notes}
    />
  );
};

export const Default: Story = {
  render: (args) => <InteractiveAssignView {...args} />,
  args: {
    selectedCategories: createMockSelectedCategories(),
    autoAssign: createMockAutoAssign(),
    notes: createMockNotes(),
  },
};

export const WithSelectedCategories: Story = {
  render: (args) => <InteractiveAssignView {...args} />,
  args: {
    selectedCategories: createMockSelectedCategories({
      selectedCategories: [
        createMockCategory({ name: "Groceries" }),
        createMockCategory({ name: "Transport" }),
        createMockCategory({ name: "Entertainment" }),
      ],
      categoryTotals: {
        available: 1250.5,
        leftover: 200.0,
        assigned: 800.0,
        spending: 650.5,
        futureCredit: 0,
      },
      monthTotals: {
        leftover: 450.0,
        assigned: 2100.0,
        spending: 1850.5,
        available: 2550.5,
      },
      currentMonthName: "March",
    }),
    autoAssign: createMockAutoAssign({
      assign: {
        amount: () => 500.0,
        display: true,
        handler: () => {},
      },
    }),
    notes: createMockNotes(),
  },
};

export const HighBudgetAmounts: Story = {
  render: (args) => <InteractiveAssignView {...args} />,
  name: "High Budget Amounts",
  args: {
    selectedCategories: createMockSelectedCategories({
      selectedCategories: [
        createMockCategory({ name: "Mortgage" }),
        createMockCategory({ name: "Savings" }),
        createMockCategory({ name: "Insurance" }),
      ],
      categoryTotals: {
        available: 5750.0,
        leftover: 1200.0,
        assigned: 4500.0,
        spending: 3950.0,
        futureCredit: 250.0,
      },
      monthTotals: {
        leftover: 2100.0,
        assigned: 8500.0,
        spending: 7250.0,
        available: 9750.0,
      },
      currentMonthName: "December",
    }),
    autoAssign: createMockAutoAssign({
      assign: {
        amount: () => 2500.0,
        display: true,
        handler: () => {},
      },
    }),
    notes: createMockNotes(),
  },
};

export const AutoAssignClosed: Story = {
  render: (args) => <InteractiveAssignView {...args} />,
  name: "Auto Assign Panel Closed",
  args: {
    selectedCategories: createMockSelectedCategories({
      selectedCategories: [createMockCategory({ name: "Utilities" })],
      categoryTotals: {
        available: 350.0,
        leftover: 50.0,
        assigned: 300.0,
        spending: 275.0,
        futureCredit: 0,
      },
      currentMonthName: "June",
    }),
    autoAssign: createMockAutoAssign({
      assign: {
        amount: () => 300.0,
        display: true,
        handler: () => {},
      },
      ui: {
        open: false,
        toggleOpen: () => {},
      },
    }),
    notes: createMockNotes(),
  },
};

export const CategoryDetailsClosed: Story = {
  render: (args) => <InteractiveAssignView {...args} />,
  name: "Category Details Closed",
  args: {
    selectedCategories: createMockSelectedCategories({
      selectedCategories: [
        createMockCategory({ name: "Dining Out" }),
        createMockCategory({ name: "Coffee" }),
      ],
      categoryTotals: {
        available: 180.0,
        leftover: 30.0,
        assigned: 150.0,
        spending: 125.5,
        futureCredit: 0,
      },
      open: false,
      currentMonthName: "September",
    }),
    autoAssign: createMockAutoAssign({
      assign: {
        amount: () => 150.0,
        display: true,
        handler: () => {},
      },
    }),
    notes: createMockNotes(),
  },
};

export const NoFundingAvailable: Story = {
  render: (args) => <InteractiveAssignView {...args} />,
  name: "No Funding Available",
  args: {
    selectedCategories: createMockSelectedCategories({
      selectedCategories: [createMockCategory({ name: "Emergency Fund" })],
      categoryTotals: {
        available: 0,
        leftover: 0,
        assigned: 0,
        spending: 0,
        futureCredit: 0,
      },
      monthTotals: {
        leftover: 0,
        assigned: 1500.0,
        spending: 1500.0,
        available: 0,
      },
      currentMonthName: "February",
    }),
    autoAssign: createMockAutoAssign({
      assign: {
        amount: () => 0,
        display: false,
        handler: () => {},
      },
    }),
    notes: createMockNotes(),
  },
};

export const MixedStates: Story = {
  render: (args) => <InteractiveAssignView {...args} />,
  name: "Mixed Panel States",
  args: {
    selectedCategories: createMockSelectedCategories({
      selectedCategories: [
        createMockCategory({ name: "Rent" }),
        createMockCategory({ name: "Groceries" }),
        createMockCategory({ name: "Gas" }),
        createMockCategory({ name: "Phone" }),
      ],
      categoryTotals: {
        available: 2150.75,
        leftover: 350.25,
        assigned: 1800.5,
        spending: 1650.0,
        futureCredit: 100.0,
      },
      monthTotals: {
        leftover: 500.0,
        assigned: 3200.0,
        spending: 2950.75,
        available: 3700.75,
      },
      open: true,
      currentMonthName: "November",
    }),
    autoAssign: createMockAutoAssign({
      assign: {
        amount: () => 1200.0,
        display: true,
        handler: () => {},
      },
      ui: {
        open: false,
        toggleOpen: () => {},
      },
    }),
    notes: createMockNotes(),
  },
};
