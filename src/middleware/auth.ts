// // middleware/auth.ts
// import { NextFunction, Request, Response } from "express";
// import { JwtPayload } from "jsonwebtoken";
// import config from "../config";
// import { prisma } from "../lib/prisma";
// import catchAsync from "../utils/catchAsync";
// import { jwtUtils } from "../utils/jwt";
// import { Role, UserStatus } from "../../generated/prisma/enums";

// declare global {
//     namespace Express {
//         interface Request {
//             user?: {
//                 email: string;
//                 name: string;
//                 id: string;
//                 role: Role;
//                 activeStatus: string; 
//             }
//         }
//     }
// }

// export const auth = (...requiredRoles: Role[]) => {
//     return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//         console.log('===== AUTH MIDDLEWARE START =====');
//         console.log('Required Roles:', requiredRoles);
        
    
//         let token = req.cookies?.accessToken;
        
//         if (!token && req.headers.authorization) {
//             if (req.headers.authorization.startsWith("Bearer ")) {
//                 token = req.headers.authorization.split(" ")[1];
//             } else {
//                 token = req.headers.authorization;
//             }
//         }

//         console.log('Token:', token ? 'Present' : 'Missing');

        
//         if (!token) {
//             console.log('No token provided');
//             return res.status(401).json({
//                 success: false,
//                 message: "You are not logged in. Please log in to access this resource."
//             });
//         }

        
//         const verificationResult = jwtUtils.verifyToken(token, config.jwt_access_secret);
//         console.log('Verification result:', verificationResult.success ? 'Success' : 'Failed');

        
//         if (!verificationResult.success) {
//             console.log('Token verification failed:', verificationResult.error);
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid or expired token. Please log in again."
//             });
//         }

    
//         const userData = verificationResult.data as JwtPayload;
//         console.log('User data from token:', { 
//             id: userData?.id, 
//             email: userData?.email, 
//             role: userData?.role 
//         });

        
//         if (!userData || !userData.id) {
//             console.log('Invalid token data structure');
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid token structure. Please log in again."
//             });
//         }

        
//         let user = null;
//         try {
//             user = await prisma.user.findUnique({
//                 where: { id: userData.id },
//                 select: {
//                     id: true,
//                     email: true,
//                     name: true,
//                     role: true,
//                     status: true
//                 }
//             });
//         } catch (error) {
//             console.log('Database error:', error);
//             return res.status(500).json({
//                 success: false,
//                 message: "Database error occurred. Please try again later."
//             });
//         }

//         console.log('User found:', user ? 'Yes' : 'No');

        
//         if (!user) {
//             console.log('User not found in database');
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found. Please log in again."
//             });
//         }

    
//         if (user.status === UserStatus.BANNED) {
//             console.log('User is banned');
//             return res.status(403).json({
//                 success: false,
//                 message: "Your account has been banned. Please contact support."
//             });
//         }

//         // Check if user has required role (if roles are specified)
//         if (requiredRoles.length > 0) {
//             const userRole = user.role;
//             console.log(`Checking role: Required [${requiredRoles.join(', ')}], Got [${userRole}]`);
            
//             if (!requiredRoles.includes(userRole)) {
//                 console.log(`Role check failed. Required: ${requiredRoles.join(', ')}, Got: ${userRole}`);
//                 return res.status(403).json({
//                     success: false,
//                     message: `Forbidden. Required roles: ${requiredRoles.join(', ')}. Your role: ${userRole}.`
//                 });
//             }
//             console.log('Role check passed');
//         }

        
//         req.user = {
//             id: user.id,
//             email: user.email,
//             name: user.name || '',
//             role: user.role,
//             activeStatus: user.status 
//         };

//         console.log('req.user set:', req.user);
//         console.log('===== AUTH MIDDLEWARE END =====');
        
//         next();
//     });
// };

import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { Role, UserStatus } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                role: Role;
                activeStatus: UserStatus;
            };
        }
    }
}

export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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

        const userData = verificationResult.data as JwtPayload & { id: string };

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