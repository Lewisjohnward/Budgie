import { Router } from "express";
import { editMemo } from "./memo.controller";

const router = Router();

router.patch("/:id", editMemo);

export default router;
