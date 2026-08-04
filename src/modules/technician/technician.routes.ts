import { Router } from "express";
import { technicianController } from "./technician.controller";
import { auth } from "../../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

router.use(auth(Role.TECHNICIAN));

router.put("/profile", technicianController.updateProfile);
router.put("/availability", technicianController.updateAvailability);
router.post("/services", technicianController.createService);
router.get("/bookings", technicianController.getMyBookings);
router.patch("/bookings/:id", technicianController.updateBookingStatus);
router.get("/profile", technicianController.getMyProfile);

router.get("/availability", technicianController.getAvailability);
export const technicianRoutes = router;