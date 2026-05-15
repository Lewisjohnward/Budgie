import { CategoryBranded } from "@/core/types/NormalizedData";
import clsx from "clsx";
import { Pencil } from "lucide-react";

export interface SelectedCategoriesProps {
  selectedCategories: CategoryBranded[];
}

export function SelectedCategories({
  selectedCategories,
}: SelectedCategoriesProps) {
  const numberOfCategories = selectedCategories.length;
  const isSingleCategory = numberOfCategories === 1;

  return (
    <div
      className={clsx(
        selectedCategories.length > 0 && "py-4",
        "flex items-center rounded overflow-hidden"
      )}
    >
      <div
        className={`w-96 2xl:w-[500px] ${isSingleCategory ? "truncate" : ""}`}
      >
        <p
          className={`text-xl font-bold ${isSingleCategory ? "truncate" : ""}`}
        >
          {isSingleCategory
            ? selectedCategories[0].name
            : `${numberOfCategories} Categories Selected`}
        </p>
        {!isSingleCategory && (
          <p className="text-sm">
            {selectedCategories.map((c) => c.name).join(", ")}
          </p>
        )}
      </div>
      {isSingleCategory && (
        <button>
          <Pencil className="w-4 h-4 stroke-gray-500" />
        </button>
      )}
    </div>
  );
}
