import { FaCircleInfo } from "react-icons/fa6";

type AccountAlertProps = {
  count: number;
  onClick: () => void;
};

export function AccountAlert({ count, onClick }: AccountAlertProps) {
  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex justify-between items-center gap-2 p-2 bg-blue-700/20 cursor-pointer hover:bg-blue-700/40"
    >
      <span className="flex items-center gap-2">
        <FaCircleInfo aria-hidden="true" />
        <span>
          {count === 1
            ? "1 new transaction to categorise"
            : `${count} new transactions to categorise`}
        </span>
      </span>

      <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-sky-700 text-white">
        View
      </span>
    </button>
  );
}
