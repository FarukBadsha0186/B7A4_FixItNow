"use strict";
// export const authController = new AuthController();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_1 = __importDefault(require("http-status"));
const auth_service_1 = require("./auth.service");
const registerUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const user = await auth_service_1.authService.registerUser(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: `${user.role} registered successfully`,
        data: { user }
    });
});
const loginUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const payload = req.body;
    const { accessToken, refreshToken } = await auth_service_1.authService.loginUser(payload);
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
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User logged in successfully",
        data: { accessToken, refreshToken }
    });
});
const refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const { accessToken } = await auth_service_1.authService.refreshToken(token);
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Token refreshed successfully",
        data: { accessToken }
    });
});
exports.authController = {
    registerUser,
    loginUser,
    refreshToken
};
