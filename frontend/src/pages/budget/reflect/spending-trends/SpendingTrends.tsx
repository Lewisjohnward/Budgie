import { TitleBar } from "../components/TitleBar";
import { useSpendingData } from "../hooks/useSpendingData";

const PAGE_KEY = "spending-trends" as const;

export function SpendingTrends() {
  const { spendingData, titleBarState, viewModeState } = useSpendingData(PAGE_KEY);

  // TODO(lewis 2025-11-24 04:57): month state
  // TODO(lewis 2025-11-24 04:57): category state
  // TODO(lewis 2025-11-24 04:57): account state

  return (
    <div className="h-full pt-0 flex flex-col gap-2">
      <TitleBar titleBarState={titleBarState} />
      <div className="flex-1 flex gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 bg-white rounded">Trends Graph</div>
          <div className="flex-1 bg-white rounded">Trends Details</div>
        </div>
        <div className="flex-1 bg-white rounded">Trends Aside</div>
      </div>
    </div>
  );
}
