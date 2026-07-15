import { testSnapshot } from "./createBudgetSnapshot";
import { ApiBudgetSnapshot } from "@/core/types/exported-types";

let snapshot: ApiBudgetSnapshot = testSnapshot;

export function getSnapshot(): ApiBudgetSnapshot {
  return snapshot;
}

export function setSnapshot(data: ApiBudgetSnapshot) {
  snapshot = structuredClone(data);
}

// export function resetSnapshot() {
//   snapshot = createBudgetSnapshot();
// }
