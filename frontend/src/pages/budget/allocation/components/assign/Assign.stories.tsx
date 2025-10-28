import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { createStore } from "@/core/store/store";
import { Assign } from "./components";

const store = createStore();

const meta: Meta<typeof Assign> = {
  component: Assign,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-200 w-96 h-[800px] p-2 border border-gray-200">
        <Provider store={store}>
          <Story />
        </Provider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AssignStory: Story = {
  args: {},
};
