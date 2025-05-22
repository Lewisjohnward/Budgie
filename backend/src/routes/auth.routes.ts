import express from "express";
import { register, login, refresh, logout } from "../controllers/auth/_index";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);

export { router as authRoutes };
