import { HttpError } from "../../../../shared/errors";

/**
 * Error thrown when a hydration invariant is violated during
 * the construction or validation of the normalized hydration state.
 *
 * This indicates a backend consistency issue rather than a user error,
 * such as missing required data, duplicate records, or data falling
 * outside the expected hydration range.
 *
 *
 * @param message - Human-readable description of the invariant violation
 * @param code - Machine-readable classification of the failure:
 *  - MISSING_DATA: Required hydration data is missing
 *  - DUPLICATE_DATA: Duplicate entries were detected where uniqueness is required
 *  - OUT_OF_RANGE: Data exists outside the expected hydration range
 */
export class HydrationInvariantError extends HttpError {
  constructor(
    message: string,
    public readonly code: "MISSING_DATA" | "DUPLICATE_DATA" | "OUT_OF_RANGE"
  ) {
    super(message, 500);
  }
}
