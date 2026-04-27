import { getMemo } from "./application/services/getMemo";
import { getMemos } from "./application/services/getMemos";
import { initialiseMemos } from "./application/services/initialiseMemos";
import { insertMissingMemos } from "./application/services/insertMissingMemos";

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

  insertMissingMemos,
};
