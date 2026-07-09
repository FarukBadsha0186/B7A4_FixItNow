import { Router } from "express";
import { customerController } from "./customer.controller";
import { auth } from "../../middleware/auth";
import { Role } from "@prisma/client";
const router = Router();
// ---------- Public routes (no auth required) ----------
router.get("/services", customerController.getAllServices);
router.get("/technicians", customerController.getAllTechnicians);
router.get("/technicians/:id", customerController.getTechnicianById);
router.get("/categories", customerController.getAllCategories);
// ---------- Protected routes (CUSTOMER only) ----------
router.post("/bookings", auth(Role.CUSTOMER), customerController.createBooking);
router.get("/bookings", auth(Role.CUSTOMER), customerController.getMyBookings);
router.get("/bookings/:id", auth(Role.CUSTOMER), customerController.getBookingById);
router.patch("/bookings/:id/cancel", auth(Role.CUSTOMER), customerController.cancelBooking);
router.post("/reviews", auth(Role.CUSTOMER), customerController.createReview);
export const customerRoutes = router;
