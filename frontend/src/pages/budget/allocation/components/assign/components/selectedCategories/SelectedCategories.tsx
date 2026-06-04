import { CategoryBranded } from "@/core/types/NormalizedData";
import {
  CategoryContextMenu,
  CategoryContextType,
} from "@/pages/budget/allocation/contextMenus/CategoryContextMenu";
import { CategoryBreakdownView } from "@/pages/budget/allocation/hooks/useAllocation/useCategoryBreakdown";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Pencil } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
        <CategoryContextMenu category={{ name: "hello", id: "temp" }}>
          <Pencil className="w-4 h-4 stroke-gray-500" />
        </CategoryContextMenu>
      )}
    </div>
  );
}

// const CategoryContextSchema = z.object({
//   name: z.string().min(1, { message: "Category requires a name" }),
//   categoryId: z.string().uuid(),
// });

// export function EditCategory({ children }: { children: ReactNode }) {
//   const [contextOpen, setContextOpen] = useState(false);
//   const [editCategory] = useEditCategoryMutation();
//   const [deleteCategory] = useDeleteCategoryMutation();
//
//   const category = {
//     name: "test",
//     id: "temp-id",
//   };
//
//   const form = useForm<CategoryContextType>({
//     defaultValues: {
//       name: category.name,
//       categoryId: category.id,
//     },
//     resolver: zodResolver(CategoryContextSchema),
//   });
//
//   const { reset, control, handleSubmit } = form;
//
//   const handleOpen = (open: boolean) => {
//     if (!open) reset();
//   };
//
//   useEffect(() => {
//     reset({
//       name: category.name,
//       categoryId: category.id,
//     });
//   }, [category.name, category.id]);
//
//   const onSubmit = (updatedCategory: CategoryContextType) => {
//     editCategory(updatedCategory);
//     closeContextMenu();
//     reset();
//   };
//
//   const handleDelete = (categoryId: string) => {
//     deleteCategory({ categoryId });
//   };
//
//   const openContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
//     e.preventDefault();
//     setContextOpen(true);
//   };
//
//   const closeContextMenu = () => {
//     setContextOpen(false);
//   };
//
//   return <button>{children}</button>;
// }
