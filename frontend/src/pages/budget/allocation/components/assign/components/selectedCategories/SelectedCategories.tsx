import { Category } from "@/core/types/NormalizedData";
import clsx from "clsx";
import { Pencil } from "lucide-react";

export interface SelectedCategoriesProps {
  categories: Category[];
}

export function SelectedCategories({ categories }: SelectedCategoriesProps) {
  const numberOfCategories = categories.length;
  const isSingleCategory = numberOfCategories === 1;

  return (
    <div
      className={clsx(
        categories.length > 0 && "py-4",
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
            ? categories[0].name
            : `${numberOfCategories} Categories Selected`}
        </p>
        {!isSingleCategory && (
          <p className="text-sm">{categories.map((c) => c.name).join(", ")}</p>
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
