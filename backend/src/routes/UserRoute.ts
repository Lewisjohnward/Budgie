import express from "express";
import {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
} from "../controllers";
import { Authenticate } from "../middleware/CommonAuth";

const router = express.Router();

/* Authentication */
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);

/* Password */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", changePassword);

router.use(Authenticate);
router.patch("/me");

/* User preferences */
router.get("/me/preferences");
router.put("/me/preferences");

export { router as UserRoute };
