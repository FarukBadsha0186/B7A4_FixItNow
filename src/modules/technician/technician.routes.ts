// import { Router } from "express";
// import { technicianController } from "./technician.controller";
// import { auth } from "../../middleware/auth";
// import { Role } from "@prisma/client";

// const router = Router();

// router.use(auth(Role.TECHNICIAN));

// router.put("/profile", technicianController.updateProfile);
// //router.patch("/availability", technicianController.updateAvailability);
// router.patch("/availability", technicianController.updateAvailability); 
// router.post("/services", technicianController.createService);
// router.get("/bookings", technicianController.getMyBookings);
// router.patch("/bookings/:id", technicianController.updateBookingStatus);
// router.get("/profile", technicianController.getMyProfile);

// router.get("/availability", technicianController.getAvailability);






// router.get("/bookings/stats", technicianController.getBookingStats);

// export const technicianRoutes = router;

import { Router } from "express";
import { technicianController } from "./technician.controller";
import { auth } from "../../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

router.use(auth(Role.TECHNICIAN));

// Profile
router.get("/profile", technicianController.getMyProfile);
router.put("/profile", technicianController.updateProfile);

// Availability
router.get("/availability", technicianController.getAvailability);
router.patch("/availability", technicianController.updateAvailability); // ✅ PATCH

// Services
router.post("/services", technicianController.createService);

// Bookings
router.get("/bookings", technicianController.getMyBookings);
router.patch("/bookings/:id", technicianController.updateBookingStatus); // ✅ Only once
router.get("/bookings/stats", technicianController.getBookingStats);

export const technicianRoutes = router;