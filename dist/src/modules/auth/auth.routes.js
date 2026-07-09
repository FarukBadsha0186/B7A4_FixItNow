"use strict";
// import { Router } from "express";
// import { authController } from "./auth.controller";
// import { auth } from "../../middleware/auth";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
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
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.authController.registerUser);
router.post("/login", auth_controller_1.authController.loginUser);
router.post("/refresh-token", auth_controller_1.authController.refreshToken);
exports.authRoutes = router;
// "name": "FixIt Customer",
//   "email": "fixitcustomer@example.com",
//   "name": "FixIt Technician",
//    "email": "techfaruknew@example.com",
