import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { IRegisterUser, ILoginUser } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { Role, UserStatus } from "@prisma/client";



const registerUser = async (payload: IRegisterUser) => {
    const { name, email, password, phone, role = Role.CUSTOMER } = payload;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
        throw new Error("Name is required and must be at least 2 characters");
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("A valid email is required");
    }
    if (!password || typeof password !== "string" || password.length < 6) {
        throw new Error("Password is required and must be at least 6 characters");
    }
    if (role && !["CUSTOMER", "TECHNICIAN", "ADMIN"].includes(role)) {
        throw new Error("role must be one of: CUSTOMER, TECHNICIAN");
    }
    if (role === Role.ADMIN) {
        throw new Error("Cannot register as ADMIN");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            status: UserStatus.ACTIVE,
            ...(role === Role.TECHNICIAN
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
const loginUser = async (payload: ILoginUser) => {
    const { email, password } = payload;

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    if (user.status === UserStatus.BANNED) {
        throw new Error("Your account has been banned!");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
        throw new Error("Password is incorrect");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret!,
        config.jwt_access_expires_in
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret!,
        config.jwt_refresh_expires_in
    );

    return { accessToken, refreshToken ,role: user.role};
};

const refreshToken = async (token: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(token, config.jwt_refresh_secret!);

    if (!verifiedRefreshToken.success) {
        throw new Error(verifiedRefreshToken.error);
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({ where: { id } });

    if (user.status === UserStatus.BANNED) {
        throw new Error("User is banned!");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret!,
        config.jwt_access_expires_in
    );

    return { accessToken };
};


const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

export const authService = {
    registerUser,
    loginUser,
    refreshToken,
    getCurrentUser
};