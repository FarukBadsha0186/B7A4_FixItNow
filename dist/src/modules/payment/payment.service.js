"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const crypto_1 = require("crypto");
const prisma_1 = require("../../lib/prisma");
const stripe_1 = require("../../lib/stripe");
const config_1 = __importDefault(require("../../config"));
const getPagination = (query) => {
    const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit || "10", 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
const createPaymentSession = async (customerId, payload) => {
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: payload.bookingId },
        include: { service: true, payment: true }
    });
    if (!booking) {
        throw new Error("Booking not found");
    }
    if (booking.customerId !== customerId) {
        throw new Error("You do not have access to this booking");
    }
    if (booking.status !== "ACCEPTED") {
        throw new Error(`Booking must be in ACCEPTED status to pay. Current status: ${booking.status}`);
    }
    if (booking.payment) {
        throw new Error("A payment for this booking already exists");
    }
    const transactionId = `TXN-${(0, crypto_1.randomUUID)()}`;
    const session = await stripe_1.stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: { name: booking.service.title },
                    unit_amount: Math.round(booking.totalAmount * 100)
                },
                quantity: 1
            }
        ],
        metadata: {
            bookingId: booking.id,
            transactionId
        },
        success_url: `${config_1.default.client_success_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: config_1.default.client_cancel_url
    });
    const payment = await prisma_1.prisma.payment.create({
        data: {
            bookingId: booking.id,
            transactionId,
            amount: booking.totalAmount,
            method: "card",
            provider: "STRIPE",
            status: "PENDING",
            providerRef: session.id
        }
    });
    return { payment, checkoutUrl: session.url };
};
const markPaymentCompleted = async (sessionId) => {
    const payment = await prisma_1.prisma.payment.findFirst({ where: { providerRef: sessionId } });
    if (!payment || payment.status === "COMPLETED")
        return;
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.payment.update({
            where: { id: payment.id },
            data: { status: "COMPLETED", paidAt: new Date() }
        }),
        prisma_1.prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "PAID" }
        })
    ]);
};
const markPaymentFailed = async (sessionId) => {
    const payment = await prisma_1.prisma.payment.findFirst({ where: { providerRef: sessionId } });
    if (!payment)
        return;
    await prisma_1.prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" }
    });
};
const handleStripeWebhook = async (rawBody, signature) => {
    let event;
    try {
        event = stripe_1.stripe.webhooks.constructEvent(rawBody, signature, config_1.default.stripe_webhook_secret);
    }
    catch (err) {
        throw new Error("Invalid Stripe webhook signature");
    }
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            await markPaymentCompleted(session.id);
            break;
        }
        case "checkout.session.expired": {
            const session = event.data.object;
            await markPaymentFailed(session.id);
            break;
        }
        default:
            break;
    }
    return { received: true };
};
const getMyPayments = async (customerId, query) => {
    const { page, limit, skip } = getPagination(query);
    const where = { booking: { customerId } };
    const [payments, total] = await Promise.all([
        prisma_1.prisma.payment.findMany({
            where,
            include: { booking: { include: { service: true } } },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma_1.prisma.payment.count({ where })
    ]);
    return { payments, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
};
const getPaymentById = async (customerId, id, role) => {
    const payment = await prisma_1.prisma.payment.findUnique({
        where: { id },
        include: { booking: true }
    });
    if (!payment) {
        throw new Error("Payment not found");
    }
    if (payment.booking.customerId !== customerId && role !== "ADMIN") {
        throw new Error("You do not have access to this payment");
    }
    return payment;
};
exports.paymentService = {
    createPaymentSession,
    handleStripeWebhook,
    getMyPayments,
    getPaymentById
};
