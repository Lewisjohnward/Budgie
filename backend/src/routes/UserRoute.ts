import express from "express";
import {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers";

const router = express.Router();

/* Authentication */
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

/* Password */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);

/* User */
router.get("/me");
router.patch("/me");

/* User preferences */
router.get("/me/preferences");
router.put("/me/preferences");

export { router as UserRoute };
