"use strict";
// // src/utils/jwt.ts
// import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtUtils = void 0;
// export const jwtUtils = {
//     generateToken: (payload: object, secret: string, expiresIn: string = "7d"): string => {
//         try {
//             const options: SignOptions = {
//                 expiresIn: expiresIn as any 
//             };
//             return jwt.sign(payload, secret, options);
//         } catch (error) {
//             console.error('Error generating token:', error);
//             throw new Error('Failed to generate token');
//         }
//     },
//     verifyToken: (token: string, secret: string): { success: boolean; data?: JwtPayload; error?: string } => {
//         try {
//             const decoded = jwt.verify(token, secret) as JwtPayload;
//             return { success: true, data: decoded };
//         } catch (error: any) {
//             console.error('Token verification error:', error.message);
//             return { 
//                 success: false, 
//                 error: error.message || 'Invalid token' 
//             };
//         }
//     },
//     // Optional: Generate refresh token
//     generateRefreshToken: (payload: object, secret: string, expiresIn: string = "30d"): string => {
//         try {
//             const options: SignOptions = {
//                 expiresIn: expiresIn as any
//             };
//             return jwt.sign(payload, secret, options);
//         } catch (error) {
//             console.error('Error generating refresh token:', error);
//             throw new Error('Failed to generate refresh token');
//         }
//     },
//     // Optional: Decode token without verification
//     decodeToken: (token: string): JwtPayload | null => {
//         try {
//             return jwt.decode(token) as JwtPayload;
//         } catch (error) {
//             console.error('Error decoding token:', error);
//             return null;
//         }
//     }
// };
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (payload, secret, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
const verifyToken = (token, secret) => {
    try {
        const data = jsonwebtoken_1.default.verify(token, secret);
        return { success: true, data };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Invalid token"
        };
    }
};
const decodeToken = (token) => {
    return jsonwebtoken_1.default.decode(token);
};
exports.jwtUtils = {
    createToken,
    verifyToken,
    decodeToken
};
