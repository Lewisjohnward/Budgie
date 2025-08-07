import type { Meta, StoryObj } from "@storybook/react";
import { AssignModal } from "./AssignModal";
import {
  FundingState,
  FundingStatus,
  FundingLevel,
} from "../../types/assignTypes";

const meta: Meta<typeof AssignModal> = {
  component: AssignModal,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-200 w-96 p-2 border border-gray-200">
        {Story()}
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;
const underfundedNoMoney: FundingState = {
  status: FundingStatus.Underfunded,
  fundingLevel: FundingLevel.NoMoney,
  fullyFundedCategories: [],
};

export const UnderfundedNoMoney: Story = {
  args: { open: true, onClose: () => {}, fundingState: underfundedNoMoney },
};

const underfundedPartial: FundingState = {
  status: FundingStatus.Underfunded,
  fundingLevel: FundingLevel.Funded,
  fullyFundedCategories: [],
  partiallyFundedCategory: {
    name: "Category Group",
    category: {
      name: "Category 1",
      amount: 100,
      percentFunded: 50,
    },
  },
};

export const UnderfundedPartial: Story = {
  args: { open: true, onClose: () => {}, fundingState: underfundedPartial },
};

const fullyFundedSingle: FundingState = {
  status: FundingStatus.Underfunded,
  fundingLevel: FundingLevel.Funded,
  fullyFundedCategories: [
    {
      name: "Category group",
      categories: [{ name: "Category 1", amount: 100 }],
    },
  ],
};

export const FullyFundedSingle: Story = {
  args: { open: true, onClose: () => {}, fundingState: fullyFundedSingle },
};

const fullyFundedMultiple: FundingState = {
  status: FundingStatus.Underfunded,
  fundingLevel: FundingLevel.Funded,
  fullyFundedCategories: [
    {
      name: "Category group",
      categories: [
        { name: "Category 1", amount: 100 },
        { name: "Category 2", amount: 200 },
      ],
    },
    {
      name: "Category group",
      categories: [{ name: "Category 3", amount: 200 }],
    },
  ],
};

export const FullyFundedMultiple: Story = {
  args: { open: true, onClose: () => {}, fundingState: fullyFundedMultiple },
};

const fullyFundedMultiplePartial: FundingState = {
  status: FundingStatus.Underfunded,
  fundingLevel: FundingLevel.Funded,
  fullyFundedCategories: [
    {
      name: "Category group",
      categories: [
        { name: "Category 2", amount: 100 },
        { name: "Category 3", amount: 200 },
      ],
    },
    {
      name: "Category group",
      categories: [{ name: "Category 4", amount: 200 }],
    },
  ],
  partiallyFundedCategory: {
    name: "Category Group",
    category: {
      name: "Category 1",
      amount: 100,
      percentFunded: 50,
    },
  },
};

export const FullyFundedMultiplePartial: Story = {
  args: {
    open: true,
    onClose: () => {},
    fundingState: fullyFundedMultiplePartial,
  },
};

const alreadyFunded: FundingState = {
  status: FundingStatus.Underfunded,
  fundingLevel: FundingLevel.AlreadyFunded,
  fullyFundedCategories: [],
};

export const AlreadyFunded: Story = {
  args: { open: true, onClose: () => {}, fundingState: alreadyFunded },
};

const assignedLastMonth: FundingState = {
  status: FundingStatus.AssignedLastMonth,
  categories: [
    {
      name: "Category group",
      categories: [
        { name: "Category 1", amount: 100 },
        { name: "Category 2", amount: 200 },
      ],
    },
  ],
};

export const AssignedLastMonth: Story = {
  args: { open: true, onClose: () => {}, fundingState: assignedLastMonth },
};

const assignedLastMonthEmpty: FundingState = {
  status: FundingStatus.AssignedLastMonth,
  categories: [],
};

export const AssignedLastMonthEmpty: Story = {
  args: { open: true, onClose: () => {}, fundingState: assignedLastMonthEmpty },
};

const fundingWithLongCategoryNames: FundingState = {
  status: FundingStatus.Underfunded,
  fundingLevel: FundingLevel.Funded,
  partiallyFundedCategory: {
    name: "Category Group",
    category: {
      name: "long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name",
      amount: 100,
      percentFunded: 50,
    },
  },
  fullyFundedCategories: [
    {
      name: "Category group",
      categories: [
        { name: "Category 1", amount: 100 },
        {
          name: "long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name",
          amount: 200,
        },
      ],
    },
  ],
};

export const FundingWithLongCategoryNames: Story = {
  args: {
    open: true,
    onClose: () => {},
    fundingState: fundingWithLongCategoryNames,
  },
};

const fundingWithLotsOfCategories: FundingState = {
  status: FundingStatus.Underfunded,
  fundingLevel: FundingLevel.Funded,
  partiallyFundedCategory: {
    name: "Category Group",
    category: {
      name: "long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name",
      amount: 100,
      percentFunded: 50,
    },
  },
  fullyFundedCategories: [
    {
      name: "Category group",
      categories: [
        { name: "Category 1", amount: 100 },
        {
          name: "long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name long name",
          amount: 200,
        },
        { name: "Category 2", amount: 100 },
        {
          name: "category 3",
          amount: 200,
        },
        { name: "Category 4", amount: 100 },
        {
          name: "category 5",
          amount: 200,
        },
        { name: "Category 6", amount: 100 },
        {
          name: "category 7",
          amount: 200,
        },
        { name: "Category 8", amount: 100 },
        {
          name: "category 9",
          amount: 200,
        },
        { name: "Category 10", amount: 100 },
        {
          name: "category 11",
          amount: 200,
        },
        {
          name: "category 12",
          amount: 200,
        },
        {
          name: "category 13",
          amount: 20000000,
        },
        {
          name: "category 14",
          amount: 20000000,
        },
        {
          name: "category 15",
          amount: 20000000,
        },
        {
          name: "category 16",
          amount: 20000000,
        },
        {
          name: "category 17",
          amount: 20000000,
        },
      ],
    },
  ],
};

export const FundingWithLotsOfCategories: Story = {
  args: {
    open: true,
    onClose: () => {},
    fundingState: fundingWithLotsOfCategories,
  },
};
