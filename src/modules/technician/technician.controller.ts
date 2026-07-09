import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { technicianService } from "./technician.service";

const updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const profile = await technicianService.updateProfile(userId , req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Profile updated successfully",
        data: profile
    });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const slots = await technicianService.updateAvailability(userId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Availability updated successfully",
        data: slots
    });
});

const createService = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const service = await technicianService.createService(userId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Service created successfully",
        data: service
    });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { bookings, meta } = await technicianService.getMyBookings(userId, req.query as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Bookings fetched successfully",
        data: bookings,
        meta
    });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const booking = await technicianService.updateBookingStatus(userId, id as string, req.body.status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Booking status updated successfully",
        data: booking
    });
});

export const technicianController = {
    updateProfile,
    updateAvailability,
    createService,
    getMyBookings,
    updateBookingStatus
};