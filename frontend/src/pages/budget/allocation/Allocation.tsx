import { Header } from "./components/header/Header";
import { Assign } from "./components/assign/components/Assign";
import { Categories } from "./components/categories/Categories";
import { AllocationLayout } from "./components/Layout";
import { useAllocation } from "./hooks/useAllocation/useAllocation";

export default function Allocation() {
  const { categoryState, headerState, assignState } = useAllocation();

  return (
    <AllocationLayout
      header={<Header {...headerState} />}
      primary={<Categories {...categoryState} />}
      sidebar={<Assign assign={assignState.assign} />}
    />
  );
}
