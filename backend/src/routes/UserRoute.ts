import express from "express";
import {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
} from "../controllers/auth/_index";

const router = express.Router();

/* Authentication */
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);

/* Password */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);

export { router as UserRoute };
