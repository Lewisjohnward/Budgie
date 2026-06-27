import {
  useDeleteCategoryGroupMutation,
  useUpdateCategoryGroupMutation,
} from "@/core/api/budget/categoryGroup/CategoryGroupApiSlice";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToggle } from "../components/assign/hooks";
import { CategoryGroupWithMetrics } from "../utils/assembleCategoryGroupViews";
import { CategoryGroupId } from "../types/types";
import { CategoryGroupDeleteState } from "../utils/getCategoryGroupDeleteState";
import {
  CategorySelectOptions,
  ExcludeTarget,
} from "../hooks/useAllocation/useAllocation";
import { DeleteCategoryDialog } from "../dialogs/deleteCategoryDialog/DeleteCategoryDialog";

const CategoryGroupContextSchema = z.object({
  name: z.string().min(1, { message: "Category requires a name" }),
});

export type CategoryGroupContextType = z.infer<
  typeof CategoryGroupContextSchema
>;

export type DeleteState = {
  type: "category" | "categoryGroup";
  name: string;
  categoryCount?: number;
  hasAssigned: boolean;
  transactionCount: number;
};

type CategoryGroupContextMenuProps = {
  children: ReactNode;
  categoryGroup: CategoryGroupWithMetrics;
  getCategorySelectOptions: (exclude?: ExcludeTarget) => CategorySelectOptions;
  getCategoryGroupDeleteState: (
    categoryGroupId: CategoryGroupId
  ) => CategoryGroupDeleteState;
};

export function CategoryGroupContextMenu({
  children,
  categoryGroup,
  getCategoryGroupDeleteState,
  getCategorySelectOptions,
}: CategoryGroupContextMenuProps) {
  const [contextOpen, setContextOpen] = useState(false);
  const [updateCategoryGroup] = useUpdateCategoryGroupMutation();
  const [deleteCategoryGroup] = useDeleteCategoryGroupMutation();

  const form = useForm<CategoryGroupContextType>({
    defaultValues: {
      name: categoryGroup.name,
    },
    resolver: zodResolver(CategoryGroupContextSchema),
  });

  const { reset, control, handleSubmit } = form;

  useEffect(() => {
    reset({
      name: categoryGroup.name,
    });
  }, [categoryGroup.name, categoryGroup.id]);

  const handleOpen = (open: boolean) => {
    if (!open) reset();
  };

  const onSubmit = (updatedCategoryGroup: CategoryGroupContextType) => {
    updateCategoryGroup({
      categoryGroupId: categoryGroup.id,
      name: updatedCategoryGroup.name,
    });
    closeContextMenu();
    reset();
  };
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [selectOptions, setSelectOptions] =
    useState<CategorySelectOptions | null>(null);
  const [hasAssigned, setHasAssigned] = useState<boolean>(false);

  const { value: open, toggle } = useToggle(false);
  const handleDelete = () => {
    const state = getCategoryGroupDeleteState(categoryGroup.id);

    if (state.canDelete)
      deleteCategoryGroup({ categoryGroupId: categoryGroup.id });
    toggle();
    setContextOpen(false);
    const selectionOptions = getCategorySelectOptions({
      type: "categoryGroup",
      id: categoryGroup.id,
    });
    setSelectOptions(selectionOptions);

    setDeleteState({
      type: "categoryGroup",
      hasAssigned: state.hasAssigned,
      transactionCount: state.transactionCount,
      categoryCount: state.categoryCount,
      name: categoryGroup.name,
    });
  };

  const acceptDelete = () => {
    deleteCategoryGroup({ categoryGroupId: categoryGroup.id });
  };

  const openContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    setContextOpen(true);
  };

  const closeContextMenu = () => {
    setContextOpen(false);
  };

  const cancelDeleteModal = () => {
    toggle();
  };

  return (
    <div onContextMenu={openContextMenu}>
      <DeleteCategoryDialog
        open={open}
        toggle={toggle}
        state={deleteState}
        accept={acceptDelete}
        cancel={cancelDeleteModal}
        selectOptions={selectOptions}
      />

      <Popover open={contextOpen} onOpenChange={handleOpen}>
        <PopoverTrigger className="w-full text-left cursor-auto">
          {children}
        </PopoverTrigger>
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
                    onClick={handleDelete}
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
