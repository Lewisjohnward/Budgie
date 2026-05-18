import { CategoryBranded } from "@/core/types/NormalizedData";
import { CategoryBreakdownView } from "@/pages/budget/allocation/hooks/useAllocation/useCategoryBreakdown";
import clsx from "clsx";
import { Pencil } from "lucide-react";

export type SelectedCategoriesProps = {
  selectedCategories: CategoryBranded[];
  view: CategoryBreakdownView;
};

export function SelectedCategories({
  selectedCategories,
  view,
}: SelectedCategoriesProps) {
  const numberOfCategoriesSelected = selectedCategories.length;
  const isSingle = view.kind === "single";

  const displayEditButton = isSingle && !view.isUncategorisedSelected;

  return (
    <div
      className={clsx(
        numberOfCategoriesSelected > 0 && "py-4",
        "flex items-center rounded overflow-hidden"
      )}
    >
      <div className={`w-96 2xl:w-[500px] ${isSingle ? "truncate" : ""}`}>
        <p className={`text-xl font-bold ${isSingle ? "truncate" : ""}`}>
          {isSingle
            ? selectedCategories[0].name
            : `${numberOfCategoriesSelected} Categories Selected`}
        </p>
        {!isSingle && (
          <p className="text-sm">
            {selectedCategories.map((c) => c.name).join(", ")}
          </p>
        )}
      </div>
      {displayEditButton && (
        <button>
          <Pencil className="w-4 h-4 stroke-gray-500" />
        </button>
      )}
    </div>
  );
}
