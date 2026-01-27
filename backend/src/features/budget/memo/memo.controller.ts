import { NextFunction, Request, Response } from "express";
import { editMemoSchema } from "./memo.schema";
import { memoUseCase } from "./memo.useCase";

/**
 * Updates a single memo owned by the authenticated user.
 *
 * - Memo ID is taken from the route parameter
 * - Request body is validated with `editMemoSchema`
 * - Edit logic and ownership checks are handled in the use case
 *
 * Responds with 200 on success.
 * Forwards validation and domain errors to error middleware.
 */

export const editMemo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const memoId = req.params.id;
  const userId = req.user?._id!;

  try {
    const payload = editMemoSchema.parse({ id: memoId, ...req.body });

    await memoUseCase.editMemo(userId, payload);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
