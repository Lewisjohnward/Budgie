import { Router } from "express";
import { authRoutes } from "./auth/auth.routes";
import { passwordRoutes } from "./password/password.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/password", passwordRoutes);

export default router;