"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.technicianService = void 0;
const prisma_1 = require("../../lib/prisma");
const getPagination = (query) => {
    const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit || "10", 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
const getProfileOrThrow = async (userId) => {
    const User = await prisma_1.prisma.technicianProfile.findUnique({ where: { userId } });
    if (!User) {
        throw new Error("Technician profile not found");
    }
    return User;
};
const updateProfile = async (userId, payload) => {
    const profile = await getProfileOrThrow(userId);
    return prisma_1.prisma.technicianProfile.update({
        where: { id: profile.id },
        data: payload
    });
};
const updateAvailability = async (userId, payload) => {
    const profile = await getProfileOrThrow(userId);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.availability.deleteMany({ where: { technicianId: profile.id } }),
        prisma_1.prisma.availability.createMany({
            data: payload.slots.map((slot) => ({ ...slot, technicianId: profile.id }))
        })
    ]);
    return prisma_1.prisma.availability.findMany({ where: { technicianId: profile.id } });
};
const createService = async (userId, payload) => {
    const profile = await getProfileOrThrow(userId);
    const category = await prisma_1.prisma.category.findUnique({ where: { id: payload.categoryId } });
    if (!category) {
        throw new Error("Category does not exist");
    }
    return prisma_1.prisma.service.create({
        data: { ...payload, technicianId: profile.id }
    });
};
const getMyBookings = async (userId, query) => {
    const profile = await getProfileOrThrow(userId);
    const { page, limit, skip } = getPagination(query);
    const where = { technicianId: profile.id };
    if (query.status)
        where.status = query.status;
    const [bookings, total] = await Promise.all([
        prisma_1.prisma.booking.findMany({
            where,
            include: {
                customer: { select: { id: true, name: true, email: true } },
                service: true
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma_1.prisma.booking.count({ where })
    ]);
    return {
        bookings,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
    };
};
const VALID_TRANSITIONS = {
    REQUESTED: ["ACCEPTED", "DECLINED"],
    PAID: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"]
};
const updateBookingStatus = async (userId, bookingId, status) => {
    const profile = await getProfileOrThrow(userId);
    const booking = await prisma_1.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
        throw new Error("Booking not found");
    }
    if (booking.technicianId !== profile.id) {
        throw new Error("You do not have access to this booking");
    }
    const allowedNext = VALID_TRANSITIONS[booking.status] || [];
    if (!allowedNext.includes(status)) {
        throw new Error(`Cannot transition booking from ${booking.status} to ${status}. A booking must be PAID before it can move to IN_PROGRESS.`);
    }
    return prisma_1.prisma.booking.update({
        where: { id: bookingId },
        data: { status: status }
    });
};
exports.technicianService = {
    updateProfile,
    updateAvailability,
    createService,
    getMyBookings,
    updateBookingStatus
};
