import { type Request, type Response, type NextFunction } from "express";
import { hydrationUseCase } from "./hydration.usecase";

import YAML from "yamljs";
import path from "path";

export const openApiDocument = YAML.load(
  path.resolve(__dirname, "../../../../../docs/api/openapi.yml")
);

import OpenAPIResponseValidator from "openapi-response-validator";

export const snapshotValidator = new OpenAPIResponseValidator({
  responses: openApiDocument.paths["/budget/snapshot"].get.responses,
  components: openApiDocument.components,
});

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
    const error = snapshotValidator.validateResponse(
      200,
      normalisedHydrationData
    );

    res.status(200).json(normalisedHydrationData);
  } catch (error) {
    next(error);
  }
};
