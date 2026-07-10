import { randomUUID } from "crypto";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import config from "../../config";
import { ICreatePayment, IConfirmPayment, IListQuery } from "./payment.interface";

const getPagination = (query: IListQuery) => {
    const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit || "10", 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

// const createPaymentSession = async (customerId: string, payload: ICreatePayment) => {
//     const booking = await prisma.booking.findUnique({
//         where: { id: payload.bookingId },
//         include: { service: true, payment: true }
//     });

//     if (!booking) {
//         throw new Error("Booking not found");
//     }
//     if (booking.customerId !== customerId) {
//         throw new Error("You do not have access to this booking");
//     }
//     if (booking.status !== "ACCEPTED") {
//         throw new Error(
//             `Booking must be in ACCEPTED status to pay. Current status: ${booking.status}`
//         );
//     }
//     if (booking.payment) {
//         throw new Error("A payment for this booking already exists");
//     }

//     const transactionId = `TXN-${randomUUID()}`;

//     const session = await stripe.checkout.sessions.create({
//         mode: "payment",
//         payment_method_types: ["card"],
//         line_items: [
//             {
//                 price_data: {
//                     currency: "usd",
//                     product_data: { name: booking.service.title },
//                     unit_amount: Math.round(booking.totalAmount * 100)
//                 },
//                 quantity: 1
//             }
//         ],
//         metadata: {
//             bookingId: booking.id,
//             transactionId
//         },
//         success_url: `${config.client_success_url}?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: config.client_cancel_url
//     });

//     const payment = await prisma.payment.create({
//         data: {
//             bookingId: booking.id,
//             transactionId,
//             amount: booking.totalAmount,
//             method: "card",
//             provider: "STRIPE",
//             status: "PENDING",
//             providerRef: session.id
//         }
//     });

//     return { payment, checkoutUrl: session.url, sessionId: session.id };
// };

const markPaymentCompleted = async (sessionId: string) => {
    const payment = await prisma.payment.findFirst({ where: { providerRef: sessionId } });
    if (!payment || payment.status === "COMPLETED") return payment;

    const [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
            where: { id: payment.id },
            data: { status: "COMPLETED", paidAt: new Date() }
        }),
        prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: "PAID" }
        })
    ]);

    return updatedPayment;
};

const markPaymentFailed = async (sessionId: string) => {
    const payment = await prisma.payment.findFirst({ where: { providerRef: sessionId } });
    if (!payment) return;

    await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" }
    });
};

// POST /api/payments/webhook — automatic, called by Stripe itself
const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe_webhook_secret);
    } catch (err) {
        throw new Error("Invalid Stripe webhook signature");
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await markPaymentCompleted(session.id);
            break;
        }
        case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            await markPaymentFailed(session.id);
            break;
        }
        default:
            break;
    }

    return { received: true };
};

// POST /api/payments/confirm — manual fallback, called by the client after redirect
// const confirmPayment = async (customerId: string, payload: IConfirmPayment) => {
//     const { sessionId } = payload;

//     const payment = await prisma.payment.findFirst({
//         where: { providerRef: sessionId },
//         include: { booking: true }
//     });

//     if (!payment) {
//         throw new Error("Payment not found for this session");
//     }
//     if (payment.booking.customerId !== customerId) {
//         throw new Error("You do not have access to this payment");
//     }

//     if (payment.status === "COMPLETED") {
//         return payment;
//     }

//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     if (session.payment_status === "paid") {
//         const updated = await markPaymentCompleted(sessionId);
//         return updated;
//     }

//     throw new Error(`Payment has not been completed yet. Status: ${session.payment_status}`);
// };

const getMyPayments = async (customerId: string, query: IListQuery) => {
    const { page, limit, skip } = getPagination(query);
    const where = { booking: { customerId } };

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            include: { booking: { include: { service: true } } },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.payment.count({ where })
    ]);

    return { payments, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
};

const getPaymentById = async (customerId: string, id: string, role: string) => {
    const payment = await prisma.payment.findUnique({
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


const createPaymentSession = async (customerId: string, payload: ICreatePayment) => {
    // Input validation
    if (!payload.bookingId || typeof payload.bookingId !== "string") {
        throw new Error("bookingId is required");
    }

    const booking = await prisma.booking.findUnique({
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
        throw new Error(
            `Booking must be in ACCEPTED status to pay. Current status: ${booking.status}`
        );
    }
    if (booking.payment) {
        throw new Error("A payment for this booking already exists");
    }

    const transactionId = `TXN-${randomUUID()}`;

    const session = await stripe.checkout.sessions.create({
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
        success_url: `${config.client_success_url}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: config.client_cancel_url
    });

    const payment = await prisma.payment.create({
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

    return { payment, checkoutUrl: session.url, sessionId: session.id };
};

const confirmPayment = async (customerId: string, payload: IConfirmPayment) => {
    // Input validation
    if (!payload.sessionId || typeof payload.sessionId !== "string") {
        throw new Error("sessionId is required");
    }

    const { sessionId } = payload;

    const payment = await prisma.payment.findFirst({
        where: { providerRef: sessionId },
        include: { booking: true }
    });

    if (!payment) {
        throw new Error("Payment not found for this session");
    }
    if (payment.booking.customerId !== customerId) {
        throw new Error("You do not have access to this payment");
    }

    if (payment.status === "COMPLETED") {
        return payment;
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
        const updated = await markPaymentCompleted(sessionId);
        return updated;
    }

    throw new Error(`Payment has not been completed yet. Status: ${session.payment_status}`);
};

export const paymentService = {
    createPaymentSession,
    handleStripeWebhook,
    confirmPayment,
    getMyPayments,
    getPaymentById
};