import { Router } from "express";
import { login, reset } from "./demo.controller";
import { authenticateDemoSecret } from "./demo.middleware";

const router = Router();

router.post("/login", login);

router.use(authenticateDemoSecret);
router.post("/reset", reset);

export { router as demoRoutes };
