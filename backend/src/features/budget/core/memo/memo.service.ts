import { getMemo } from "./application/services/getMemo";
import { getMemos } from "./application/services/getMemos";
import { initialiseMemos } from "./application/services/initialiseMemos";
import { insertMissingMemos } from "./application/services/insertMissingMemos";
import { ensureMemosContinuity } from "./application/services/updateMemo";
import { updateMemo } from "./application/services/ensureMemosContinuity";

/**
 * Memo domain service.
 *
 * Provides transactional operations for retrieving and maintaining
 * month memos and their invariants.
 */

export const memoService = {
  getMemo,
  getMemos,
  initialiseMemos,
  ensureMemosContinuity,
  updateMemo,
  insertMissingMemos,
};
