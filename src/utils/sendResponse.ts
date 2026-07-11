import { Response } from "express";

interface IApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}

export const sendResponse = <T>(res: Response, payload: IApiResponse<T>) => {
    return res.status(payload.statusCode).json({
        success: payload.success,
        message: payload.message,
        data: payload.data ?? null,
        ...(payload.meta ? { meta: payload.meta } : {})
    });
};