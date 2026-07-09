"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../lib/prisma");
const jwt_1 = require("../../utils/jwt");
const config_1 = __importDefault(require("../../config"));
const client_1 = require("@prisma/client");
const registerUser = async (payload) => {
    const { name, email, password, phone, role = client_1.Role.CUSTOMER } = payload;
    if (role === client_1.Role.ADMIN) {
        throw new Error("Cannot register as ADMIN");
    }
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("User already exists with this email");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            status: client_1.UserStatus.ACTIVE,
            ...(role === client_1.Role.TECHNICIAN
                ? { technicianProfile: { create: {} } }
                : {})
        },
        select: {
            id: true, name: true, email: true, phone: true,
            role: true, status: true, createdAt: true, updatedAt: true,
            technicianProfile: true
        }
    });
    return user;
};
const loginUser = async (payload) => {
    const { email, password } = payload;
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { email } });
    if (user.status === client_1.UserStatus.BANNED) {
        throw new Error("Your account has been banned!");
    }
    const isPasswordMatched = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Password is incorrect");
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    const accessToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return { accessToken, refreshToken };
};
const refreshToken = async (token) => {
    const verifiedRefreshToken = jwt_1.jwtUtils.verifyToken(token, config_1.default.jwt_refresh_secret);
    if (!verifiedRefreshToken.success) {
        throw new Error(verifiedRefreshToken.error);
    }
    const { id } = verifiedRefreshToken.data;
    const user = await prisma_1.prisma.user.findUniqueOrThrow({ where: { id } });
    if (user.status === client_1.UserStatus.BANNED) {
        throw new Error("User is banned!");
    }
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
    const accessToken = jwt_1.jwtUtils.createToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return { accessToken };
};
exports.authService = {
    registerUser,
    loginUser,
    refreshToken
};
