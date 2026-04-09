import { Router } from "express";

import { Authenticate } from "../../shared/middleWare/CommonAuth";

import accountRoutes from "./account/account.routes";
import categoryRoutes from "./category/category.router";
import categorygroupRoutes from "./categorygroup/categorygroup.routes";
import payeeRoutes from "./payee/payee.routes";
import transactionRoutes from "./transaction/transaction.routes";
import memoRoutes from "./memo/memo.routes";

const router = Router();

router.use(Authenticate);
router.use("/account", accountRoutes);
router.use("/category", categoryRoutes);
router.use("/categorygroup", categorygroupRoutes);
router.use("/transaction", transactionRoutes);
router.use("/payees", payeeRoutes);
router.use("/memo", memoRoutes);

export default router;
