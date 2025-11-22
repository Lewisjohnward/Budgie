import { ReflectHeader } from "./components/ReflectHeader";
import { Outlet } from "react-router-dom";

// TODO(lewis 2025-11-24 05:24): what is the purpose of these?
export { SpendingBreakdown } from "./spending-breakdown/SpendingBreakdown";
export { SpendingTrends } from "./spending-trends/SpendingTrends";

export default function Reflect() {
  return (
    <div className="h-screen min-w-[1200px] flex flex-col bg-stone-100 overflow-auto">
      <ReflectHeader />
      <div className="flex-1 px-8 pt-8 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
