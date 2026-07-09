import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const { users, meta } = await adminService.getAllUsers(req.query as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users fetched successfully",
        data: users,
        meta
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await adminService.updateUserStatus(id as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User status updated successfully",
        data: user
    });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
    const { bookings, meta } = await adminService.getAllBookings(req.query as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Bookings fetched successfully",
        data: bookings,
        meta
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const categories = await adminService.getAllCategories();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories fetched successfully",
        data: categories
    });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await adminService.createCategory(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: category
    });
});

export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllBookings,
    getAllCategories,
    createCategory
};