
import express from "express";
import {
  forgotPassword,
  resetPassword,
  changePassword,
} from "./password.controller";
import { Authenticate } from "../../../shared/middleWare/CommonAuth";

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.use(Authenticate);
router.patch("/change-password", changePassword);

export { router as passwordRoutes };