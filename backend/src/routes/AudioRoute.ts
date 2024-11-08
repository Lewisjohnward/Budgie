import express, { Request, Response, NextFunction } from "express";
import { test1 } from "../controllers";

const router = express.Router();

router.post("/test", test1);

// router.get("/", (req: Request, res: Response, next: NextFunction) => {
//   res.json({ message: "Hello from the audio route" });
// });

export { router as AudioRoute };
