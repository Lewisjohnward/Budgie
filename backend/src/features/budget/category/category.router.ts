import { Router } from "express";
import categoryRoutes from "./core/category.routes";
import monthRoutes from "./months/month.routes";

const router = Router();

router.use("/", categoryRoutes);
router.use("/months", monthRoutes);

export default router;
