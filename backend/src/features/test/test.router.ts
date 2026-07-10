import { Router } from "express";
import { reset, seed } from "./test.controller";

const router = Router();

router.post("/reset", reset);
router.post("/seed/:scenario", seed);

export { router as testRoutes };
