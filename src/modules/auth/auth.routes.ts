
// export default router;

import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);

export const authRoutes = router;


// "name": "FixIt Customer",
//   "email": "fixitcustomer@example.com",

//   "name": "FixIt Technician",
//    "email": "techfaruknew@example.com",