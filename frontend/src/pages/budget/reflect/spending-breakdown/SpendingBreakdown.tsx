import { Tabs, TabsList, TabsTrigger } from "@/core/components/uiLibrary/tabs";
import { useSpendingData, type ViewMode } from "../hooks/useSpendingData";
import { TitleBar } from "../components/TitleBar";
import { PieExample } from "./PieExample";

const PAGE_KEY = "spending-breakdown" as const;

export function SpendingBreakdown() {
  const { spendingData, titleBarState, viewModeState } =
    useSpendingData(PAGE_KEY);

  // TODO(lewis 2025-11-23 00:24): this needs to go inside hook !!
  const totalSpending = spendingData.reduce((sum, item) => sum + item.value, 0);

  // TODO(lewis 2025-11-24 04:58): titleBarState:

  // TODO(lewis 2025-11-24 04:57): month state
  // TODO(lewis 2025-11-24 04:57): category state
  // TODO(lewis 2025-11-24 04:57): account state

  return (
    <div className="h-full flex flex-col gap-4">
      <TitleBar titleBarState={titleBarState} />
      <div className="flex-1 flex gap-4">
        <div className="flex-[2] flex flex-col gap-4">
          <div className="flex-[3] p-6 rounded bg-white">
            <div className="flex justify-between">
              <div>
                <div className="text-gray-500 font-[400]">Total spending</div>
                <div className="text-3xl font-bold">
                  £
                  {totalSpending.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <Tabs
                value={viewModeState.viewMode}
                onValueChange={(mode) =>
                  viewModeState.setViewMode(mode as ViewMode)
                }
              >
                <TabsList className="w-56 flex">
                  <TabsTrigger className="flex-1 flex" value="categories">
                    Categories
                  </TabsTrigger>
                  <TabsTrigger className="flex-1 flex" value="groups">
                    Groups
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <PieExample data={spendingData} />
          </div>
          <div className="flex-1 px-4 py-2 space-y-4 bg-white rounded">
            <div className="flex">
              <div className="flex-1">
                <p className="text-neutral-500 font-[500]">
                  Average Monthly Spending
                </p>
                <p className="font-[500]">$13.00</p>
              </div>
              <div className="flex-1">
                <p className="text-neutral-500 font-[500]">
                  Average Monthly Spending
                </p>
                <p className="font-[500]">$13.00</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-1">
                <p className="text-neutral-500 font-[500]">
                  Most Frequent Group
                </p>
                <p className="font-[500]">Needs</p>
                <p className="text-sm">2 transactions</p>
              </div>
              <div className="flex-1">
                <p className="text-neutral-500 font-[500]">Largest Outflow</p>
                <p className="font-[500]">n/a</p>
                <p className="text-sm">£4.00</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded">
          <div className="flex justify-between p-4">
            <p className="text-neutral-500 font-[500]">
              {viewModeState.viewMode === "categories"
                ? "Categories"
                : "Groups"}
            </p>
            <p className="text-neutral-500 font-[500]">Total Spending</p>
          </div>
          <div className="border-t border-gray-200" />
          <div className="p-4 pt-2 space-y-3">
            {spendingData.map((item) => {
              const percentage = ((item.value / totalSpending) * 100).toFixed(
                0
              );
              return (
                <div key={item.name}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-[500]">
                      £
                      {item.value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="h-4 rounded transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                    <div
                      className="flex items-center"
                      style={{
                        left: `${percentage}%`,
                      }}
                    >
                      <span className="pl-0 text-xs text-gray-600 font-medium">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
