import { Router } from "express";

import { Authenticate } from "../../shared/middleWare/CommonAuth";

import accountRoutes from "./core/account/account.routes";
import categoryRoutes from "./core/category/category.router";
import categorygroupRoutes from "./core/categorygroup/categorygroup.routes";
import payeeRoutes from "./core/payee/payee.routes";
import transactionRoutes from "./core/transaction/transaction.routes";
import memoRoutes from "./core/memo/memo.routes";
import hydrationRoutes from "./queries/hydration/hydration.routes";

const router = Router();

router.use(Authenticate);
router.use("/snapshot", hydrationRoutes);
router.use("/account", accountRoutes);
router.use("/categories", categoryRoutes);
router.use("/category-groups", categorygroupRoutes);
router.use("/transaction", transactionRoutes);
router.use("/payees", payeeRoutes);
router.use("/memo", memoRoutes);

export default router;
