import { Header } from "./components/header/Header";
import { AllocationPanel } from "./components/assign/components/AllocationPanel";
import { Categories } from "./components/categories/Categories";
import { AllocationLayout } from "./components/Layout";
import { useAllocation } from "./hooks/useAllocation/useAllocation";

export default function Allocation() {
  const {
    currency,
    rtaInformation,
    categoryBreakdown,
    autoAssign,
    note,
    categorySelector,
    selectedCategories,
    expandCategoryGroups,
    view,
    monthSelector,
    categoriesSelector,
  } = useAllocation();

  return (
    <AllocationLayout
      header={
        <Header
          currency={currency}
          monthSelector={monthSelector}
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
          categoryBreakDown={categoryBreakdown}
          autoAssign={autoAssign}
          note={note}
        />
      }
    />
  );
}
