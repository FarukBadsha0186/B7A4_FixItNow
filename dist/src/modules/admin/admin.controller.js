"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const admin_service_1 = require("./admin.service");
const getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { users, meta } = await admin_service_1.adminService.getAllUsers(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Users fetched successfully",
        data: users,
        meta
    });
});
const updateUserStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const user = await admin_service_1.adminService.updateUserStatus(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User status updated successfully",
        data: user
    });
});
const getAllBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { bookings, meta } = await admin_service_1.adminService.getAllBookings(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Bookings fetched successfully",
        data: bookings,
        meta
    });
});
const getAllCategories = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const categories = await admin_service_1.adminService.getAllCategories();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Categories fetched successfully",
        data: categories
    });
});
const createCategory = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const category = await admin_service_1.adminService.createCategory(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Category created successfully",
        data: category
    });
});
exports.adminController = {
    getAllUsers,
    updateUserStatus,
    getAllBookings,
    getAllCategories,
    createCategory
};
