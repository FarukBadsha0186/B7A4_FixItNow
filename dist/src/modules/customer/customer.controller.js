"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const customer_service_1 = require("./customer.service");
// ---------- Public browse ----------
const getAllServices = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { services, meta } = await customer_service_1.customerService.getAllServices(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Services fetched successfully",
        data: services,
        meta
    });
});
const getAllTechnicians = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { technicians, meta } = await customer_service_1.customerService.getAllTechnicians(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Technicians fetched successfully",
        data: technicians,
        meta
    });
});
const getTechnicianById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const technician = await customer_service_1.customerService.getTechnicianById(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Technician fetched successfully",
        data: technician
    });
});
const getAllCategories = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const categories = await customer_service_1.customerService.getAllCategories();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Categories fetched successfully",
        data: categories
    });
});
// ---------- Bookings ----------
const createBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const customerId = req.user.id;
    const booking = await customer_service_1.customerService.createBooking(customerId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Booking created successfully",
        data: booking
    });
});
const getMyBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const customerId = req.user.id;
    const { bookings, meta } = await customer_service_1.customerService.getMyBookings(customerId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Bookings fetched successfully",
        data: bookings,
        meta
    });
});
const getBookingById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const customerId = req.user.id;
    const { id } = req.params;
    const booking = await customer_service_1.customerService.getBookingById(customerId, id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Booking fetched successfully",
        data: booking
    });
});
const cancelBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const customerId = req.user.id;
    const { id } = req.params;
    const booking = await customer_service_1.customerService.cancelBooking(customerId, id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Booking cancelled successfully",
        data: booking
    });
});
// ---------- Reviews ----------
const createReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const customerId = req.user.id;
    const review = await customer_service_1.customerService.createReview(customerId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Review submitted successfully",
        data: review
    });
});
exports.customerController = {
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
