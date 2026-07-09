


import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { IRegisterUser, ILoginUser } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { Role, UserStatus } from "@prisma/client";

const registerUser = async (payload: IRegisterUser) => {
    const { name, email, password, phone, role = Role.CUSTOMER } = payload;

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

    return { accessToken, refreshToken };
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

export const authService = {
    registerUser,
    loginUser,
    refreshToken
};