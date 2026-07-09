import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user!.id;
    const result = await paymentService.createPaymentSession(customerId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment session created successfully",
        data: result
    });
});

// Stripe needs the raw body for signature verification, so this handler
// does NOT use sendResponse (which assumes JSON was already parsed) —
// it just acknowledges receipt directly.
const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const result = await paymentService.handleStripeWebhook(req.body, signature);
    res.status(200).json(result);
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user!.id;
    const { payments, meta } = await paymentService.getMyPayments(customerId, req.query as any);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payments fetched successfully",
        data: payments,
        meta
    });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user!.id;
    const role = req.user!.role;
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(customerId, id as string, role);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment fetched successfully",
        data: payment
    });
});

export const paymentController = {
    createPayment,
    stripeWebhook,
    getMyPayments,
    getPaymentById
};