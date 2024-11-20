import { Textarea } from "@/core/components/uiLibrary/textarea";
import { LightningIcon } from "@/core/icons/icons";
import { bgGray, borderBottom } from "@/core/theme/colors";
import { ChevronDownIcon } from "lucide-react";
import { ReactNode } from "react";

const data = [
  {
    text: "Underfunded",
    value: 0,
  },
  {
    text: "Assigned Last Month",
    value: 0,
  },
  {
    text: "Paid Last Month",
    value: 0,
  },
  {
    text: "Average Assigned",
    value: 0,
  },
  {
    text: "Average Paid",
    value: 0,
  },
  {
    text: "Reset Amount Paid",
    value: 0,
  },
  {
    text: "Reset Assigned Amount",
    value: 0,
  },
];

export default function Assign() {
  return (
    <AssignLayout
      autoAssign={<AutoAssign />}
      notes={<Notes />}
      availableInMonth={<AvailableInMonth />}
    />
  );
}

function AssignLayout({
  autoAssign,
  notes,
  availableInMonth,
}: {
  autoAssign: ReactNode;
  notes: ReactNode;
  availableInMonth: ReactNode;
}) {
  return (
    <div className={`flex-grow space-y-2`}>
      {autoAssign}
      {availableInMonth}
    </div>
  );
}

function AutoAssign() {
  return (
    <div className="flex-grow bg-white rounded-lg">
      <button
        className={`flex items-center gap-2 px-4 py-2 border-b ${borderBottom}`}
      >
        <LightningIcon />
        <p className="text-sm font-bold">Auto-Assign</p>
        <ChevronDownIcon />
      </button>
      <div className="flex flex-col gap-2 p-4">
        {data.map((d) => (
          <button
            className={`py-1 px-2 flex-grow flex justify-between ${bgGray} rounded`}
          >
            <p>{d.text}</p>
            <p>{d.value}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function AvailableInMonth() {
  return (
    <div className="px-4 py-2 space-y-2 bg-white rounded-lg">
      <div className={`flex justify-between py-2 border-b ${borderBottom}`}>
        <div className="flex gap-2">
          <p>Available In November</p>
          <ChevronDownIcon />
        </div>
        <p>$4832.43</p>
      </div>
      <div className="flex justify-between">
        <p>Left Over from Last Month</p>
        <p>$0.00</p>
      </div>
      <div className="flex justify-between">
        <p>Assigned in November</p>
        <p>$0.00</p>
      </div>
      <div className="flex justify-between">
        <p>Activity</p>
        <p>$0.00</p>
      </div>
    </div>
  );
}

function Notes() {
  return (
    <div className="px-4 py-2 bg-white rounded-lg">
      <p>Notes</p>
      <Textarea placeholder="Enter a note..." className="border-0" />
    </div>
  );
}
