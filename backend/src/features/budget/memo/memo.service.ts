import { getMemo } from "./application/services/getMemo";
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

  initialiseMemos,

  insertMissingMemos,
};
