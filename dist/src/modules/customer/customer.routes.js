"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRoutes = void 0;
const express_1 = require("express");
const customer_controller_1 = require("./customer.controller");
const auth_1 = require("../../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// ---------- Public routes (no auth required) ----------
router.get("/services", customer_controller_1.customerController.getAllServices);
router.get("/technicians", customer_controller_1.customerController.getAllTechnicians);
router.get("/technicians/:id", customer_controller_1.customerController.getTechnicianById);
router.get("/categories", customer_controller_1.customerController.getAllCategories);
// ---------- Protected routes (CUSTOMER only) ----------
router.post("/bookings", (0, auth_1.auth)(client_1.Role.CUSTOMER), customer_controller_1.customerController.createBooking);
router.get("/bookings", (0, auth_1.auth)(client_1.Role.CUSTOMER), customer_controller_1.customerController.getMyBookings);
router.get("/bookings/:id", (0, auth_1.auth)(client_1.Role.CUSTOMER), customer_controller_1.customerController.getBookingById);
router.patch("/bookings/:id/cancel", (0, auth_1.auth)(client_1.Role.CUSTOMER), customer_controller_1.customerController.cancelBooking);
router.post("/reviews", (0, auth_1.auth)(client_1.Role.CUSTOMER), customer_controller_1.customerController.createReview);
exports.customerRoutes = router;
