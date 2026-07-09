"use strict";
// // middleware/auth.ts
// import { NextFunction, Request, Response } from "express";
// import { JwtPayload } from "jsonwebtoken";
// import config from "../config";
// import { prisma } from "../lib/prisma";
// import catchAsync from "../utils/catchAsync";
// import { jwtUtils } from "../utils/jwt";
// import { Role, UserStatus } from "../../generated/prisma/enums";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const config_1 = __importDefault(require("../config"));
const prisma_1 = require("../lib/prisma");
const catchAsync_1 = require("../utils/catchAsync");
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.catchAsync)(async (req, res, next) => {
        let token = req.cookies?.accessToken;
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : req.headers.authorization;
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "You are not logged in. Please log in to access this resource.",
                errorDetails: null
            });
        }
        const verificationResult = jwt_1.jwtUtils.verifyToken(token, config_1.default.jwt_access_secret);
        if (!verificationResult.success) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token. Please log in again.",
                errorDetails: null
            });
        }
        const userData = verificationResult.data;
        if (!userData?.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid token structure. Please log in again.",
                errorDetails: null
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userData.id },
            select: { id: true, email: true, name: true, role: true, status: true }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please log in again.",
                errorDetails: null
            });
        }
        if (user.status === client_1.UserStatus.BANNED) {
            return res.status(403).json({
                success: false,
                message: "Your account has been banned. Please contact support.",
                errorDetails: null
            });
        }
        if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden. Required role(s): ${requiredRoles.join(", ")}. Your role: ${user.role}.`,
                errorDetails: null
            });
        }
        req.user = {
            id: user.id,
            name: user.name || "",
            email: user.email,
            role: user.role,
            activeStatus: user.status
        };
        next();
    });
};
exports.auth = auth;
