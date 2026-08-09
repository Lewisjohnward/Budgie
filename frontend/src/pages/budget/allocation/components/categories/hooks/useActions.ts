import {
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/core/api/budget/category/categoryApiSlice";
import {
  useDeleteCategoryGroupMutation,
  useUpdateCategoryGroupMutation,
} from "@/core/api/budget/categoryGroup/CategoryGroupApiSlice";
import {
  DeleteArgs,
  useDeleteDialog,
} from "../../../dialogs/deleteCategoryDialog/useDeleteDialog";
import {
  CategoryActionTarget,
  CategorySelectOptions,
  ExcludeTarget,
} from "../../../hooks/useAllocation/useAllocation";
import { CategoryGroupDeleteState } from "../../../utils/getCategoryGroupDeleteState";
import { CategoryId, CategoryGroupId } from "../../../types/types";
import { CategoryDeleteState } from "../../../utils/getCategoryDeleteState";

export type DeleteCategoryTarget = {
  id: CategoryId;
  name: string;
};

export type DeleteCategoryGroupTarget = {
  id: CategoryGroupId;
  name: string;
};

type UseCategoryActionsProps = {
  getCategorySelectOptions: (exclude?: ExcludeTarget) => CategorySelectOptions;
  getCategoryDeleteState: (categoryId: CategoryId) => CategoryDeleteState;
  getCategoryGroupDeleteState: (
    categoryGroupId: CategoryGroupId
  ) => CategoryGroupDeleteState;
};

export const useCategoryActions = ({
  getCategorySelectOptions,
  getCategoryDeleteState,
  getCategoryGroupDeleteState,
}: UseCategoryActionsProps) => {
  //======
  // Delete dialog
  //======
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteCategoryGroup] = useDeleteCategoryGroupMutation();

  // Called when user confirms delete
  const handleDelete = (args: DeleteArgs) => {
    if (args.type === "category") {
      deleteCategory(args);
    }

    if (args.type === "categoryGroup") {
      deleteCategoryGroup(args);
    }
  };

  const deleteDialog = useDeleteDialog({
    onDelete: handleDelete,
    getSelectOptions: getCategorySelectOptions,
  });

  const handleRequestDelete = (target: CategoryActionTarget) => {
    if (target.type === "category") {
      handleDeleteCategory(target);
    }

    if (target.type === "categoryGroup") {
      handleDeleteCategoryGroup(target);
    }
  };

  const [updateCategory] = useUpdateCategoryMutation();
  const [updateCategoryGroup] = useUpdateCategoryGroupMutation();

  // Called when user starts delete flow from category context menu
  const handleDeleteCategory = (target: DeleteCategoryTarget) => {
    const state = getCategoryDeleteState(target.id);

    if (state.canDelete) {
      deleteCategory({ categoryId: target.id });
      return;
    }

    deleteDialog.openDialog({
      type: "category",
      categoryId: state.categoryId,
      name: target.name,
      hasAssigned: state.hasAssigned,
      transactionCount: state.transactionCount,
    });
  };

  // Called when user starts delete flow from group context menu
  const handleDeleteCategoryGroup = (target: DeleteCategoryGroupTarget) => {
    const state = getCategoryGroupDeleteState(target.id);

    if (state.canDelete) {
      deleteCategoryGroup({ categoryGroupId: target.id });
      return;
    }

    deleteDialog.openDialog({
      type: "categoryGroup",
      categoryGroupId: state.categoryGroupId,
      name: target.name,
      hasAssigned: state.hasAssigned,
      transactionCount: state.transactionCount,
      categoryCount: state.categoryCount,
    });
  };

  const renameTarget = (target: CategoryActionTarget, name: string) => {
    if (target.type === "category") {
      updateCategory({ categoryId: target.id, name: name });
    }
    if (target.type === "categoryGroup") {
      updateCategoryGroup({ categoryGroupId: target.id, name: name });
    }
  };

  return {
    deleteDialog,
    handleRequestDelete,
    renameTarget,
  };
};
