import clsx from "clsx";

export function EmptyAccountsMessage() {
  return (
    <div className="space-y-2">
      <div className={clsx("px-2 py-2 bg-white/10 rounded text-sm")}>
        <div className="w-56">
          <p className="font-semibold">No Accounts</p>
          <p>
            You can't budget without adding accounts to YNAB first. How about
            adding one now?
          </p>
        </div>
      </div>
    </div>
  );
}
