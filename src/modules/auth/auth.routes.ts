
// export default router;

import { Router } from "express";
import { auth } from "../../middleware/auth";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.get("/me", auth(), authController.getMe);

export const authRoutes = router;

