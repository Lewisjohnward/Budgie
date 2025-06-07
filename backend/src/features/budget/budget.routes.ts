import { Router } from "express";

import { Authenticate } from "../../shared/middleWare/CommonAuth";

import accountRoutes from "./account/account.routes";
import categoryRoutes from "./category/category.routes";
import categorygroupRoutes from "./categorygroup/categorygroup.routes";
import payeeRoutes from "./payee/payee.routes";
import assignRoutes from "./assign/assign.routes";
import transactionRoutes from "./transaction/transaction.routes";

const router = Router();

router.use(Authenticate);
router.use("/account", accountRoutes);
router.use("/category", categoryRoutes);
router.use("/categorygroup", categorygroupRoutes);
router.use("/transaction", transactionRoutes);
router.use("/payees", payeeRoutes);
router.use("/assign", assignRoutes);

export default router;
