import { Category } from "@/core/types/NormalizedData";
import { Month } from "@/core/types/Allocation";
import { useAppDispatch, useAppSelector } from "@/core/hooks/reduxHooks";
import {
  addCategories,
  removeCategories,
  selectSelectedCategories,
  clearCategories,
} from "../../../slices/selectedCategorySlice";
import { useGetCategoriesQuery } from "@/core/api/budgetApiSlice";
import { useRef } from "react";
import { calculateBarColors } from "../../../utils/calculateBarColors";
import { CategoryContextMenu } from "../../../contextMenus/CategoryContextMenu";
import { Checkbox } from "@/core/components/uiLibrary/checkbox";
import {
  EmptyCell,
  CategoryGridRow,
  Available,
  CategoryCell,
  EditAssigned,
  ProgressBar,
} from "./";

export function CategoryRow({
  category,
  month,
}: {
  category: Category;
  month: Month;
}) {
  const selectedCategoryState = useAppSelector(selectSelectedCategories);

  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const currency = "£";

  const selected = selectedCategoryState.selected.some(
    (c) => c.id === category.id
  );

  const { data } = useGetCategoriesQuery();
  // TODO: I FEEL LIKE THIS LOGIC SHOULD BE IN PARENT?
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    inputRef.current?.focus();
    if (e.ctrlKey) {
      const exists = selectedCategoryState.selected.some(
        (c) => c.id === category.id
      );
      if (exists) {
        dispatch(removeCategories([category]));
      } else {
        dispatch(addCategories([category]));
      }
    } else if (e.shiftKey) {
      const previousSelectedCategory = selectedCategoryState.previousSelected;

      if (!previousSelectedCategory) {
        dispatch(clearCategories());
        dispatch(addCategories([category]));
      } else {
        const categories = Object.values(data?.categories!);
        const ids = Object.values(categories).map((c) => c.id);

        const prevIndex = ids.indexOf(previousSelectedCategory.id);
        const endIndex = ids.indexOf(category.id);

        if (prevIndex > endIndex) {
          if (selectedCategoryState.selected.length === 1) {
            const selectedCategories = categories.slice(
              endIndex,
              prevIndex + 1
            );
            const newCategories = selectedCategories.filter(
              (cat) =>
                !selectedCategoryState.selected.some(
                  (selected) => selected.id === cat.id
                )
            );
            dispatch(addCategories(newCategories));
          } else {
            const categoriesToRemove = categories.slice(
              endIndex + 1,
              prevIndex + 1
            );
            dispatch(removeCategories(categoriesToRemove));
          }
        } else {
          const selectedCategories = categories.slice(prevIndex, endIndex + 1);
          const newCategories = selectedCategories.filter(
            (cat) =>
              !selectedCategoryState.selected.some(
                (selected) => selected.id === cat.id
              )
          );
          dispatch(addCategories(newCategories));
        }
      }
    } else {
      dispatch(clearCategories());
      dispatch(addCategories([category]));
    }
  };

  const toggleSelect = () => {
    if (selected) {
      dispatch(removeCategories([category]));
    } else {
      dispatch(addCategories([category]));
    }
  };

  const { activity, available, assigned } = month;
  const values = calculateBarColors({ activity, available, assigned });

  return (
    <CategoryContextMenu category={category}>
      <div
        onClick={handleClick}
        className={`${selected && "bg-gray-100"} cursor-pointer`}
      >
        <CategoryGridRow>
          <EmptyCell />
          <div className="flex items-center min-w-0 gap-4">
            <Checkbox
              className="[&_svg]:h-3 [&_svg]:w-3 size-3 rounded-[2px] shadow-none"
              checked={selected}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect();
              }}
            />
            <div className="w-5/6">
              <div className="flex justify-between items-center gap-8">
                <p className="truncate">{category.name}</p>
                <div className="flex gap-2">
                  <p className="text-sm font-[500] text-gray-600 whitespace-nowrap">
                    {values.message?.important ?? ""}
                  </p>
                  {values.message?.text && (
                    <p className="text-sm text-gray-600 whitespace-nowrap">
                      {values.message.text ?? ""}
                    </p>
                  )}
                </div>
              </div>
              <ProgressBar
                spent={values.green}
                available={values.lightGreen}
                overspent={values.red}
              />
            </div>
          </div>
          <EditAssigned
            ref={inputRef}
            assigned={month.assigned}
            monthId={month.id}
          />
          <CategoryCell>
            {currency} {month.activity.toFixed(2)}
          </CategoryCell>
          <CategoryCell>
            <Available value={month.available} />
          </CategoryCell>
        </CategoryGridRow>
      </div>
    </CategoryContextMenu>
  );
}
