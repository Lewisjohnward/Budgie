import { Request, Response, NextFunction } from "express";
import {
  deletePayeeSchema,
  editPayeeSchema,
  editPayeesInBulkSchema,
  combinePayeesSchema,
  deletePayeesInBulkSchema,
} from "./payee.schema";
import { payeeUseCase } from "./payee.useCase";

export const getPayees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?._id!;
  try {
    const normalisedPayees = await payeeUseCase.getPayees(userId);
    res.status(200).json({ ...normalisedPayees });
  } catch (error) {
    next(error);
  }
  return;
};

export const editPayee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = editPayeeSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await payeeUseCase.editPayee(payload);

    res.status(200).json({ message: "Payee updated" });
  } catch (error) {
    next(error);
  }
  return;
};

export const deletePayee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = deletePayeeSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await payeeUseCase.deletePayee(payload);

    res.status(200).json({ message: "Payee deleted" });
  } catch (error) {
    next(error);
  }
};

export const editPayeesInBulk = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = editPayeesInBulkSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await payeeUseCase.editPayeesInBulk(payload);

    res.status(200).json({ message: "Payees updated" });
  } catch (error) {
    next(error);
  }
};

export const combinePayees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = combinePayeesSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await payeeUseCase.combinePayees(payload);

    res.status(200).json({ message: "Payees combined" });
  } catch (error) {
    next(error);
  }
};

export const deletePayeesInBulk = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = deletePayeesInBulkSchema.parse({
      userId: req.user?._id,
      ...req.body,
    });

    await payeeUseCase.deletePayeesInBulk(payload);

    res.status(200).json({ message: "Payees deleted" });
  } catch (error) {
    next(error);
  }
};
