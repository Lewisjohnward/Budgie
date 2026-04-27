interface OverspentWarningProps {
  available: number;
}

export function OverspentWarning({ available }: OverspentWarningProps) {
  return (
    <div className="bg-red-100 p-2 rounded text-sm text-center font-[500]">
      <p>
        You've overspent this category by{" "}
        <span className="bg-red-300 rounded px-1 font-bold">
          £{Math.abs(available).toFixed(2)}
        </span>
        . Cover this overspending or you can't trust your plan balances!
      </p>
    </div>
  );
}
