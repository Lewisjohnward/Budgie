import { AddCircleIcon } from "@/core/icons/icons";
import { bgGray, darkBlueBgHoverDark, darkBlueText } from "@/core/theme/colors";
import useMouseOverTimeout from "@/core/hooks/useMouseOverTimeout";
import clsx from "clsx";

interface CategoryFiltersProps {
  categories: string[];
}

export function CategoryFilters({ categories }: CategoryFiltersProps) {
  const { mouseOver, handleMouseOver } = useMouseOverTimeout();

  return (
    <>
      {categories.map((category) => (
        <button
          key={category}
          className={`px-2 py-1 ${bgGray} rounded text-xs hover:${darkBlueBgHoverDark}`}
        >
          {category}
        </button>
      ))}
      <button onMouseOver={handleMouseOver}>
        <AddCircleIcon
          className={clsx(
            mouseOver ? "rotate-180" : "",
            `h-4 w-4 ${darkBlueText} transition duration-500`
          )}
        />
      </button>
    </>
  );
}
