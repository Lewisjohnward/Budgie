import { type Request, type Response, type NextFunction } from "express";
import { hydrationUseCase } from "./hydration.usecase";
import { hydrationMapper } from "./hydration.mapper";

/**
 * Returns normalised budget hydration payload for initial app load (up to 1 year of budget data).
 */
export const getBudgetHydration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user!._id;

  try {
    const normalisedHydrationData = await hydrationUseCase.getBudgetHydration({
      userId,
    });

    const dto = hydrationMapper.toBudgetHydrationDto(normalisedHydrationData);

    res.status(200).json(dto);
  } catch (error) {
    next(error);
  }
};
