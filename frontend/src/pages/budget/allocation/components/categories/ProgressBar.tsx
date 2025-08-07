import { Progress } from "@/core/components/uiLibrary/progress";

export function ProgressBar({
  available,
  spent,
  overspent,
}: {
  available: number;
  spent: number;
  overspent: number;
}) {
  return (
    <div className="relative h-[4px] rounded-sm">
      <Progress className="h-full bg-gray-200 rounded" />
      <div className="absolute top-0 left-0 h-full w-full flex rounded">
        <Progress
          className="h-full bg-green-200 rounded-r"
          style={{ width: `${available}%` }}
        />
        <Progress
          className="h-full bg-green-400 rounded-l-[3px]  rounded-r-[3px]"
          style={{ width: `${spent}%` }}
        />
        <Progress
          className="h-full bg-red-400 rounded-l-none rounded-r"
          style={{ width: `${overspent}%` }}
        />
      </div>
    </div>
  );
}
