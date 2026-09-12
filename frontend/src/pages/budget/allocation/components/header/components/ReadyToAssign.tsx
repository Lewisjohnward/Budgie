import { TickIcon } from "@/core/icons/icons";
import { generateReadyToAssignStatus } from "../utils/generateReadyToAssignStatus";
import { useState } from "react";

import { Dialog, DialogContent } from "@/core/components/uiLibrary/dialog";
import { RtaInformation } from "../../../hooks/useAllocation/useAllocation";

export type ReadyToAssignProps = {
  currency: string;
  rtaInformation: RtaInformation;
};

type Position = {
  top: number;
  left: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function ReadyToAssign({
  currency,
  rtaInformation,
}: ReadyToAssignProps) {
  const {
    assignableLeftOverFromLastMonth,
    assignableCurrentMonth,
    totalAssignedCurrentMonth,
    available,
  } = rtaInformation;

  const state = generateReadyToAssignStatus(available);

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Position>({ top: 0, left: 0 });

  const MODAL_WIDTH = 500; // w-96
  const MODAL_HEIGHT = 160; // rough estimate
  const OFFSET_Y = 50;

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const top = rect.bottom + OFFSET_Y + window.scrollY;

    const left = rect.left + rect.width / 2 + window.scrollX - MODAL_WIDTH / 2;

    setPos({
      top: clamp(top, 10, window.innerHeight - MODAL_HEIGHT),
      left: clamp(left, 10, window.innerWidth - MODAL_WIDTH - 10),
    });

    setOpen(true);
  };

  const previousMonth = "March";
  const currentMonth = "May";

  return (
    <div className={`${state.bg} rounded flex items-center gap-8`}>
      <button onClick={handleOpen} className="px-4 py-2 text-left">
        <p className="text-black text-xl font-bold">£{available.toFixed(2)}</p>
        <p className="text-sm">{state.message}</p>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideClose
          className="
            fixed
            w-[500px]
            p-4
            bg-white
            rounded-lg
            shadow-lg
            translate-x-0
            translate-y-0
            animate-none
            overflow-visible
            gap-0
          "
          style={{
            top: pos.top,
            left: pos.left,
          }}
        >
          {/* Arrow */}
          <div
            className="
              absolute
              -top-2
              left-1/2
              h-4
              w-4
              -translate-x-1/2
              rotate-45
              bg-white
              shadow-sm
            "
          />

          <div className="font-semibold text-lg mb-2">
            Ready to Assign Breakdown
          </div>

          {/* Breakdown section */}
          <div className="rounded-lg bg-stone-50 border border-stone-200 overflow-hidden">
            {/* Row 1 */}
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-lime-700 flex items-center justify-center text-white text-xs">
                +
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-sm text-stone-800">
                    {`Ready to Assign left over from ${previousMonth}`}
                  </p>
                  <p className="text-lime-700 font-medium">
                    {assignableLeftOverFromLastMonth > 0
                      ? `+${currency}${assignableLeftOverFromLastMonth.toFixed(2)}`
                      : "0"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-stone-800">
                    {`
Inflow: Ready to Assign transactions in ${currentMonth}
`}
                  </p>
                  <p className="text-lime-700 font-medium">
                    {assignableCurrentMonth > 0
                      ? `+${currency}${assignableCurrentMonth.toFixed(2)}`
                      : "0"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200" />

            {/* Row 2 */}
            <div className="flex items-start justify-between px-4 py-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-5 w-5 rounded-full bg-stone-600 flex items-center justify-center text-white text-xs">
                  −
                </div>
                <div>
                  <p className="text-sm text-stone-800">Assigned in May</p>
                </div>
              </div>

              <div className="text-stone-700 font-medium">
                {totalAssignedCurrentMonth > 0
                  ? `-${currency}${totalAssignedCurrentMonth.toFixed(2)}`
                  : "0"}
              </div>
            </div>

            <div className="border-t border-stone-200" />

            {/* Total */}
            <div className="px-4 py-3 bg-stone-100">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-stone-900">
                  Total Ready to Assign
                </p>

                <p className="font-semibold text-lime-700">
                  {available > 0 ? `+${currency}${available.toFixed(2)}` : "0"}
                </p>
              </div>
              <div className="mt-4 text-sm text-stone-600">
                Give these dollars a job by assigning them to one or more
                categories!
              </div>
            </div>
          </div>

          {/* Footer note */}
        </DialogContent>
      </Dialog>

      {state.showIcon && <TickIcon className="h-8 w-8 text-black/40" />}
    </div>
  );
}
