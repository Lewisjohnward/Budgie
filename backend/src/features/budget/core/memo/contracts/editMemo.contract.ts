import { DomainMemo } from "../memo.types";

/**
 * Domain result of the edit memo use case.
 *
 * Represents the state change produced when editing a memo
 */
export type EditMemoResult = {
  updatedMemo: DomainMemo;
};
