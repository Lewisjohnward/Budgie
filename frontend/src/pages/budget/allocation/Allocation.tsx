import { Header } from "./components/header/Header";
import { AllocationPanel } from "./components/assign/components/AllocationPanel";
import { Categories } from "./components/categories/Categories";
import { AllocationLayout } from "./components/Layout";
import { useAllocation } from "./hooks/useAllocation/useAllocation";

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
    monthSelectorViewModel,
    categoriesSelector,
  } = useAllocation();

  return (
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
        />
      }
      sidebar={
        <AllocationPanel
          selectedCategories={selectedCategories}
          categoryBreakDownViewModel={categoryBreakdownViewModel}
          autoAssignViewModel={autoAssignViewModel}
          noteViewModel={noteViewModel}
        />
      }
    />
  );
}
