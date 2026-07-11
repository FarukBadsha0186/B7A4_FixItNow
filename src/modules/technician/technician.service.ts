import { prisma } from "../../lib/prisma";
import {
    IUpdateProfile,
    IUpdateAvailability,
    ICreateService,
    IListQuery
} from "./technician.interface";

const getPagination = (query: IListQuery) => {
    const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit || "10", 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const getProfileOrThrow = async (userId: string) => {
    const User = await prisma.technicianProfile.findUnique({ where: { userId } });
    if (!User) {
        throw new Error("Technician profile not found");
    }
    return User;
};

const updateProfile = async (userId: string, payload: IUpdateProfile) => {
    const profile = await getProfileOrThrow(userId);

    return prisma.technicianProfile.update({
        where: { id: profile.id },
        data: payload
    });
};


const updateAvailability = async (userId: string, payload: IUpdateAvailability) => {
    // Input validation
    if (!payload.slots || !Array.isArray(payload.slots) || payload.slots.length === 0) {
        throw new Error("slots must be a non-empty array");
    }
    for (const slot of payload.slots) {
        if (
            slot.dayOfWeek === undefined ||
            typeof slot.dayOfWeek !== "number" ||
            slot.dayOfWeek < 0 ||
            slot.dayOfWeek > 6
        ) {
            throw new Error("dayOfWeek must be a number between 0 (Sunday) and 6 (Saturday)");
        }
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!slot.startTime || !timeRegex.test(slot.startTime)) {
            throw new Error("startTime must be in HH:mm format (e.g. 09:00)");
        }
        if (!slot.endTime || !timeRegex.test(slot.endTime)) {
            throw new Error("endTime must be in HH:mm format (e.g. 17:00)");
        }
    }

    const profile = await getProfileOrThrow(userId);

    await prisma.$transaction([
        prisma.availability.deleteMany({ where: { technicianId: profile.id } }),
        prisma.availability.createMany({
            data: payload.slots.map((slot) => ({ ...slot, technicianId: profile.id }))
        })
    ]);

    return prisma.availability.findMany({ where: { technicianId: profile.id } });
};
const createService = async (userId: string, payload: ICreateService) => {
    // Input validation
    if (!payload.title || payload.title.trim().length < 3) {
        throw new Error("title is required and must be at least 3 characters");
    }
    if (
        payload.price === undefined ||
        typeof payload.price !== "number" ||
        payload.price <= 0
    ) {
        throw new Error("price is required and must be a positive number");
    }
    if (!payload.categoryId || typeof payload.categoryId !== "string") {
        throw new Error("categoryId is required");
    }

    const profile = await getProfileOrThrow(userId);

    const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
    if (!category) {
        throw new Error("Category does not exist");
    }

    return prisma.service.create({
        data: { ...payload, technicianId: profile.id }
    });
};
const getMyBookings = async (userId: string, query: IListQuery) => {
    const profile = await getProfileOrThrow(userId);
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = { technicianId: profile.id };
    if (query.status) where.status = query.status;

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                customer: { select: { id: true, name: true, email: true } },
                service: true
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.booking.count({ where })
    ]);

    return {
        bookings,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
    };
};

const VALID_TRANSITIONS: Record<string, string[]> = {
    REQUESTED: ["ACCEPTED", "DECLINED"],
    PAID: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"]
};


const updateBookingStatus = async (userId: string, bookingId: string, status: string) => {
    // Input validation
    const VALID_STATUSES = ["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"];
    if (!status || !VALID_STATUSES.includes(status)) {
        throw new Error(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const profile = await getProfileOrThrow(userId);

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
        throw new Error("Booking not found");
    }
    if (booking.technicianId !== profile.id) {
        throw new Error("You do not have access to this booking");
    }

    const allowedNext = VALID_TRANSITIONS[booking.status] || [];
    if (!allowedNext.includes(status)) {
        throw new Error(
            `Cannot transition booking from ${booking.status} to ${status}. A booking must be PAID before it can move to IN_PROGRESS.`
        );
    }

    return prisma.booking.update({
        where: { id: bookingId },
        data: { status: status as any }
    });
};
export const technicianService = {
    updateProfile,
    updateAvailability,
    createService,
    getMyBookings,
    updateBookingStatus
};