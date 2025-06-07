import { Router } from "express";
import { addCategoryGroup } from "./categorygroup.controller";

const router = Router();
router.post("/", addCategoryGroup);

export default router;
