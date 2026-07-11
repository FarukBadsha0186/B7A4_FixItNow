

// export const authController = new AuthController();

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { authService } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = await authService.registerUser(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: `${user.role} registered successfully`,
        data: { user }
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const { accessToken, refreshToken, role} = await authService.loginUser(payload);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `${role} logged in successfully`,
        data: { accessToken, refreshToken }
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const { accessToken } = await authService.refreshToken(token);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Token refreshed successfully",
        data: { accessToken }
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await authService.getCurrentUser(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Current user fetched successfully",
        data: user
    });
});

export const authController = {
    registerUser,
    loginUser,
    refreshToken,getMe
};