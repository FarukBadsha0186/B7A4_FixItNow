"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.technicianController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const technician_service_1 = require("./technician.service");
const updateProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const profile = await technician_service_1.technicianService.updateProfile(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Profile updated successfully",
        data: profile
    });
});
const updateAvailability = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const slots = await technician_service_1.technicianService.updateAvailability(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Availability updated successfully",
        data: slots
    });
});
const createService = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const service = await technician_service_1.technicianService.createService(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Service created successfully",
        data: service
    });
});
const getMyBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const { bookings, meta } = await technician_service_1.technicianService.getMyBookings(userId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Bookings fetched successfully",
        data: bookings,
        meta
    });
});
const updateBookingStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const booking = await technician_service_1.technicianService.updateBookingStatus(userId, id, req.body.status);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Booking status updated successfully",
        data: booking
    });
});
exports.technicianController = {
    updateProfile,
    updateAvailability,
    createService,
    getMyBookings,
    updateBookingStatus
};
