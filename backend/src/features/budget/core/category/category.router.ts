import { Router } from "express";
import categoryRoutes from "./core/category.routes";
import monthRoutes from "./months/month.routes";

const router = Router();

router.use("/months", monthRoutes);
router.use("/", categoryRoutes);

export default router;
