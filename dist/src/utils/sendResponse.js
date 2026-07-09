// import { Response } from "express";
export const sendResponse = (res, payload) => {
    return res.status(payload.statusCode).json({
        success: payload.success,
        message: payload.message,
        data: payload.data ?? null,
        ...(payload.meta ? { meta: payload.meta } : {})
    });
};
