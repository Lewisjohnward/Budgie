import { Header } from "./components/header/Header";
import { AllocationPanel } from "./components/assign/components/AllocationPanel";
import { Categories } from "./components/categories/Categories";
import { AllocationLayout } from "./components/Layout";
import { useAllocation } from "./hooks/useAllocation/useAllocation";
import { ContextMenu } from "./contextMenus/ContextMenu";
import { DeleteDialog } from "./dialogs/deleteCategoryDialog/DeleteDialog";

export default function Allocation() {
  const {
    currency,
    rtaInformation,
    categoryBreakdownViewModel,
    autoAssignViewModel,
    noteViewModel,
    categorySelector,
    selectedCategories,
    expandCategoryGroups,
    view,
    contextMenu,
    categoryActions,
    monthSelectorViewModel,
    categoriesSelector,
    validators,
  } = useAllocation();

  return (
    <>
      <AllocationLayout
        header={
          <Header
            currency={currency}
            monthSelectorViewModel={monthSelectorViewModel}
            categoriesSelector={categoriesSelector}
            rtaInformation={rtaInformation}
          />
        }
        primary={
          <Categories
            currency={currency}
            view={view}
            expandCategoryGroups={expandCategoryGroups}
            categorySelector={categorySelector}
            onContextMenu={contextMenu.open}
          />
        }
        sidebar={
          <AllocationPanel
            selectedCategories={selectedCategories}
            categoryBreakDownViewModel={categoryBreakdownViewModel}
            autoAssignViewModel={autoAssignViewModel}
            noteViewModel={noteViewModel}
            onEditCategory={contextMenu.open}
          />
        }
      />
      <DeleteDialog
        open={categoryActions.deleteDialog.open}
        state={categoryActions.deleteDialog.state}
        selectOptions={categoryActions.deleteDialog.selectOptions}
        accept={categoryActions.deleteDialog.accept}
        cancel={categoryActions.deleteDialog.cancel}
      />
      {contextMenu.target && (
        <ContextMenu
          target={contextMenu.target}
          position={contextMenu.menuPosition}
          menuRef={contextMenu.menuRef}
          overlayRef={contextMenu.overlayRef}
          canRename={validators.canRename}
          onRename={categoryActions.renameTarget}
          onDelete={categoryActions.handleRequestDelete}
          onClose={contextMenu.close}
        />
      )}
    </>
  );
}
