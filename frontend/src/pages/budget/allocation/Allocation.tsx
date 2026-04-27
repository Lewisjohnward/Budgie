import { Header } from "./components/header/Header";
import { AllocationPanel } from "./components/assign/components/AllocationPanel";
import { Categories } from "./components/categories/Categories";
import { AllocationLayout } from "./components/Layout";
import { useAllocation } from "./hooks/useAllocation/useAllocation";

export default function Allocation() {
  const {
    categoryState,
    headerState,
    categoryBreakdown,
    autoAssign,
    notes,
    categorySelector,
  } = useAllocation();

  return (
    <AllocationLayout
      header={<Header {...headerState} />}
      primary={
        <Categories categorySelector={categorySelector} {...categoryState} />
      }
      sidebar={
        <AllocationPanel
          categoryBreakDown={categoryBreakdown}
          autoAssign={autoAssign}
          notes={notes}
        />
      }
    />
  );
}
