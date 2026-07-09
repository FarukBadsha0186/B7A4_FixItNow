// import { Router } from "express";
// import { authController } from "./auth.controller";
// import { auth } from "../../middleware/auth";
// const router = Router();
// // Public routes
// router.post("/register", authController.register);
// router.post("/login", authController.login);
// router.post("/refresh-token", authController.refreshToken);
// // Protected routes
// router.get("/me", auth(), authController.getMe);
// router.post("/logout", auth(), authController.logout);
// router.get("/check", auth(), authController.checkAuth);
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
