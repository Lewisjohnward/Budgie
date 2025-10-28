import { Button } from "@/core/components/uiLibrary/button";
import { FaCircleInfo } from "react-icons/fa6";

type AccountAlertProps = {
  count: number;
};

export function AccountAlert({ count }: AccountAlertProps) {
  if (count === 0) return null;

  return (
    <div className="flex justify-between items-center gap-2 p-2 bg-blue-700/20 cursor-pointer hover:bg-blue-700/40">
      <div className="flex items-center gap-2">
        <FaCircleInfo />
        <p>
          {count > 1
            ? `${count} new transactions to categorise`
            : "1 new transaction to categorise"}
        </p>
      </div>
      <Button className="bg-sky-700 hover:bg-sky-700">View</Button>
    </div>
  );
}
