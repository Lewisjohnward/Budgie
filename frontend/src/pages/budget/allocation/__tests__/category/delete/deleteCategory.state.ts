import { ApiBudgetSnapshot } from "@/core/types/exported-types";
import { baseSnapshot } from "./deleteCategory.snapshot";

let snapshot: ApiBudgetSnapshot = baseSnapshot;

export function getSnapshot(): ApiBudgetSnapshot {
  return snapshot;
}

export function setSnapshot(data: ApiBudgetSnapshot) {
  snapshot = structuredClone(data);
}
