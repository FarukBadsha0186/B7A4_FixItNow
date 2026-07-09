// // middleware/auth.ts
// import { NextFunction, Request, Response } from "express";
// import { JwtPayload } from "jsonwebtoken";
// import config from "../config";
// import { prisma } from "../lib/prisma";
// import catchAsync from "../utils/catchAsync";
// import { jwtUtils } from "../utils/jwt";
// import { Role, UserStatus } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { UserStatus } from "@prisma/client";
export const auth = (...requiredRoles) => {
    return catchAsync(async (req, res, next) => {
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
        const verificationResult = jwtUtils.verifyToken(token, config.jwt_access_secret);
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
        const user = await prisma.user.findUnique({
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
        if (user.status === UserStatus.BANNED) {
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
