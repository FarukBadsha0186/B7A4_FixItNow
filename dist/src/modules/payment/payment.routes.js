"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_1 = require("../../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// NOTE: the webhook route is intentionally NOT registered here.
// It must be mounted separately in app.ts, BEFORE express.json(),
// using express.raw() instead — Stripe's signature check needs the
// untouched raw request body, not the parsed JSON object.
router.post("/create", (0, auth_1.auth)(client_1.Role.CUSTOMER), payment_controller_1.paymentController.createPayment);
router.get("/", (0, auth_1.auth)(client_1.Role.CUSTOMER), payment_controller_1.paymentController.getMyPayments);
router.get("/:id", (0, auth_1.auth)(client_1.Role.CUSTOMER, client_1.Role.ADMIN), payment_controller_1.paymentController.getPaymentById);
exports.paymentRoutes = router;
