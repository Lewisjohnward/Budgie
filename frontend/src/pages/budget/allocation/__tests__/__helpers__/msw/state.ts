import { ApiBudgetSnapshot } from "@/core/types/exported-types";

let snapshot: ApiBudgetSnapshot;

export function setSnapshot(data: ApiBudgetSnapshot) {
  snapshot = structuredClone(data);
}

export function getSnapshot() {
  return snapshot;
}
