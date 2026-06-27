import {
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/core/api/budget/category/categoryApiSlice";
import { Button } from "@/core/components/uiLibrary/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/core/components/uiLibrary/form";
import { Input } from "@/core/components/uiLibrary/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/uiLibrary/popover";
import { Category } from "@/core/types/NormalizedData";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { asCategoryId, CategoryId } from "../types/types";
import { useToggle } from "../components/assign/hooks";
import { CategoryDeleteState } from "../utils/getCategoryDeleteState";
import {
  ExcludeTarget,
  CategorySelectOptions,
} from "../hooks/useAllocation/useAllocation";
import { DeleteCategoryDialog } from "../dialogs/deleteCategoryDialog/DeleteCategoryDialog";
import { DeleteState } from "./CategoryGroupContextMenu";

const CategoryContextSchema = z.object({
  name: z.string().min(1, { message: "Category requires a name" }),
  id: z.string().uuid(),
});

export type CategoryContextType = z.infer<typeof CategoryContextSchema>;

type CategoryContextMenuProps = {
  children: ReactNode;
  // TODO:(lewis 2026-06-24 10:37) this type is a smell
  category: Category;
  getCategoryDeleteState: (categoryId: CategoryId) => CategoryDeleteState;
  getCategorySelectOptions: (exclude?: ExcludeTarget) => CategorySelectOptions;
};

export function CategoryContextMenu({
  children,
  category,
  getCategoryDeleteState,
  getCategorySelectOptions,
}: CategoryContextMenuProps) {
  const [contextOpen, setContextOpen] = useState(false);
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [selectOptions, setSelectOptions] =
    useState<CategorySelectOptions | null>(null);
  const [hasAssigned, setHasAssigned] = useState<boolean>(false);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);

  const form = useForm<CategoryContextType>({
    defaultValues: {
      name: category.name,
      id: category.id,
    },
    resolver: zodResolver(CategoryContextSchema),
  });

  const { reset, control, handleSubmit } = form;

  const handleOpen = (open: boolean) => {
    if (!open) reset();
  };

  useEffect(() => {
    reset({
      name: category.name,
      id: category.id,
    });
  }, [category.name, category.id]);

  const onSubmit = (updatedCategory: CategoryContextType) => {
    updateCategory({
      categoryId: asCategoryId(updatedCategory.id),
      name: updatedCategory.name,
    });
    closeContextMenu();
    reset();
  };

  const { value: deleteCategoryModalOpen, toggle } = useToggle(false);

  const handleDelete = (categoryId: string) => {
    // Check category is deletable (has no transactions or assigned)
    const state = getCategoryDeleteState(category.id);
    if (state.canDelete) deleteCategory({ categoryId });
    toggle();
    setContextOpen(false);

    const selectionOptions = getCategorySelectOptions({
      type: "category",
      id: category.id,
    });
    setSelectOptions(selectionOptions);
    setDeleteState({
      type: "category",
      hasAssigned: state.hasAssigned,
      transactionCount: state.transactionCount,
      name: category.name,
    });
  };

  const openContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    setContextOpen(true);
  };

  const closeContextMenu = () => {
    setContextOpen(false);
  };

  const acceptDelete = (inheritingCategoryId?: string) => {
    deleteCategory({ categoryId: category.id, inheritingCategoryId });
  };

  const cancelDeleteModal = () => {
    toggle();
  };

  return (
    <div onContextMenu={openContextMenu}>
      <DeleteCategoryDialog
        open={deleteCategoryModalOpen}
        toggle={toggle}
        state={deleteState}
        accept={acceptDelete}
        cancel={cancelDeleteModal}
        selectOptions={selectOptions}
      />
      <Popover open={contextOpen} onOpenChange={handleOpen}>
        <PopoverTrigger className="w-full text-left">{children}</PopoverTrigger>
        <PopoverContent
          onPointerDownOutside={closeContextMenu}
          className="w-96 px-4 py-2 space-y-2"
        >
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="focus-visible:ring-sky-700 shadow-none"
                        placeholder="New category name"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    className="bg-red-200 text-red-400 hover:text-white"
                    variant={"destructive"}
                  >
                    Delete
                  </Button>
                </div>
                <div className="space-x-2">
                  <Button
                    type="button"
                    onClick={closeContextMenu}
                    className="bg-blue-400"
                    variant={"destructive"}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600"
                    variant={"destructive"}
                  >
                    OK
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
