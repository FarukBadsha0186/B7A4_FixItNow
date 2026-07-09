"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const payment_service_1 = require("./payment.service");
const createPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const customerId = req.user.id;
    const result = await payment_service_1.paymentService.createPaymentSession(customerId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Payment session created successfully",
        data: result
    });
});
// Stripe needs the raw body for signature verification, so this handler
// does NOT use sendResponse (which assumes JSON was already parsed) —
// it just acknowledges receipt directly.
const stripeWebhook = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const result = await payment_service_1.paymentService.handleStripeWebhook(req.body, signature);
    res.status(200).json(result);
});
const getMyPayments = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const customerId = req.user.id;
    const { payments, meta } = await payment_service_1.paymentService.getMyPayments(customerId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Payments fetched successfully",
        data: payments,
        meta
    });
});
const getPaymentById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const customerId = req.user.id;
    const role = req.user.role;
    const { id } = req.params;
    const payment = await payment_service_1.paymentService.getPaymentById(customerId, id, role);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Payment fetched successfully",
        data: payment
    });
});
exports.paymentController = {
    createPayment,
    stripeWebhook,
    getMyPayments,
    getPaymentById
};
