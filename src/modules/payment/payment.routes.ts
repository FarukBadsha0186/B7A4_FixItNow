import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// NOTE: webhook route is NOT here — it's mounted separately in app.ts
// with express.raw() BEFORE express.json(), since Stripe's signature
// check requires the untouched raw request body.

router.post("/create", auth(Role.CUSTOMER), paymentController.createPayment);
router.post("/confirm", auth(Role.CUSTOMER), paymentController.confirmPayment);
router.get("/", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getMyPayments);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getPaymentById);

export const paymentRoutes = router;