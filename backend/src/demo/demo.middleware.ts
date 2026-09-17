import { type Request, type Response, type NextFunction } from "express";

export const authenticateDemoSecret = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authorization = req.headers.authorization;

  if (authorization !== `Bearer ${process.env.DEMO_RESET_SECRET}`) {
    res.sendStatus(401);
    return;
  }

  next();
};
