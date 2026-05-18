type OverspentWarningProps = {
  available: number;
  uncategorisedSelected: boolean;
};

export function OverspentWarning({
  available,
  uncategorisedSelected,
}: OverspentWarningProps) {
  return (
    <div className="bg-red-100 p-2 rounded text-sm text-center font-[500]">
      {uncategorisedSelected ? (
        <p>
          Uncategorised cash transactions still affect your plan! Assign them to
          categories or{" "}
          <span className="bg-red-300 rounded px-1 font-bold">
            £{Math.abs(available).toFixed(2)}
          </span>
          will be deducted from the amount you have available next month.
        </p>
      ) : (
        <p>
          You've overspent this category by{" "}
          <span className="bg-red-300 rounded px-1 font-bold">
            £{Math.abs(available).toFixed(2)}
          </span>
          . Cover this overspending or you can't trust your plan balances!
        </p>
      )}
    </div>
  );
}
