// import { Response } from "express";

// export function sendSuccess<T>(
//   res: Response,
//   statusCode: number,
//   message: string,
//   data?: T,
//   meta?: Record<string, unknown>
// ) {
//   return res.status(statusCode).json({
//     success: true,
//     message,
//     data: data ?? null,
//     ...(meta ? { meta } : {}),
//   });
// }

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