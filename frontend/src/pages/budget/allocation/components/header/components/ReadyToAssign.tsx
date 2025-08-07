import { TickIcon } from "@/core/icons/icons";
import { generateReadyToAssignStatus } from "../utils/generateReadyToAssignStatus";

export function ReadyToAssign({ amount }: { amount: number }) {
  const state = generateReadyToAssignStatus(amount);

  return (
    <div className={`${state.bg} rounded px-4 py-2 flex items-center gap-8`}>
      <div>
        <p className="text-black text-xl font-bold">£{amount.toFixed(2)}</p>
        <p className="text-sm">{state.message}</p>
      </div>
      {state.showIcon && <TickIcon className="h-8 w-8 text-black/40" />}
    </div>
  );
}
