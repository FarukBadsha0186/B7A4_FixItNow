"use strict";
// import { Response } from "express";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, payload) => {
    return res.status(payload.statusCode).json({
        success: payload.success,
        message: payload.message,
        data: payload.data ?? null,
        ...(payload.meta ? { meta: payload.meta } : {})
    });
};
exports.sendResponse = sendResponse;
