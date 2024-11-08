import { Request, Response, NextFunction } from "express";

export const test1 = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.json({message: "hello from test"})
  // console.log("hello");
};
