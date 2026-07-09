import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// NOTE: the webhook route is intentionally NOT registered here.
// It must be mounted separately in app.ts, BEFORE express.json(),
// using express.raw() instead — Stripe's signature check needs the
// untouched raw request body, not the parsed JSON object.

router.post("/create", auth(Role.CUSTOMER), paymentController.createPayment);
router.get("/", auth(Role.CUSTOMER), paymentController.getMyPayments);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getPaymentById);

export const paymentRoutes = router;