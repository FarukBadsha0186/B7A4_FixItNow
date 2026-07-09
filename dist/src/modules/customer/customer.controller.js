import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { customerService } from "./customer.service";
// ---------- Public browse ----------
const getAllServices = catchAsync(async (req, res) => {
    const { services, meta } = await customerService.getAllServices(req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Services fetched successfully",
        data: services,
        meta
    });
});
const getAllTechnicians = catchAsync(async (req, res) => {
    const { technicians, meta } = await customerService.getAllTechnicians(req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Technicians fetched successfully",
        data: technicians,
        meta
    });
});
const getTechnicianById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const technician = await customerService.getTechnicianById(id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Technician fetched successfully",
        data: technician
    });
});
const getAllCategories = catchAsync(async (req, res) => {
    const categories = await customerService.getAllCategories();
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories fetched successfully",
        data: categories
    });
});
// ---------- Bookings ----------
const createBooking = catchAsync(async (req, res) => {
    const customerId = req.user.id;
    const booking = await customerService.createBooking(customerId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Booking created successfully",
        data: booking
    });
});
const getMyBookings = catchAsync(async (req, res) => {
    const customerId = req.user.id;
    const { bookings, meta } = await customerService.getMyBookings(customerId, req.query);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Bookings fetched successfully",
        data: bookings,
        meta
    });
});
const getBookingById = catchAsync(async (req, res) => {
    const customerId = req.user.id;
    const { id } = req.params;
    const booking = await customerService.getBookingById(customerId, id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Booking fetched successfully",
        data: booking
    });
});
const cancelBooking = catchAsync(async (req, res) => {
    const customerId = req.user.id;
    const { id } = req.params;
    const booking = await customerService.cancelBooking(customerId, id);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Booking cancelled successfully",
        data: booking
    });
});
// ---------- Reviews ----------
const createReview = catchAsync(async (req, res) => {
    const customerId = req.user.id;
    const review = await customerService.createReview(customerId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Review submitted successfully",
        data: review
    });
});
export const customerController = {
    getAllServices,
    getAllTechnicians,
    getTechnicianById,
    getAllCategories,
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    createReview
};
