import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();



router.post("/create", auth(Role.CUSTOMER), paymentController.createPayment);
router.post("/confirm", auth(Role.CUSTOMER), paymentController.confirmPayment);
router.get("/", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getMyPayments);
router.get("/:id", auth(Role.CUSTOMER, Role.ADMIN), paymentController.getPaymentById);

export const paymentRoutes = router;