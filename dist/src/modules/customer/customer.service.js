import { prisma } from "../../lib/prisma";
const getPagination = (query) => {
    const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit || "10", 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
// ---------- Public browse ----------
const getAllServices = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const where = {};
    if (query.categoryId)
        where.categoryId = query.categoryId;
    if (query.minPrice || query.maxPrice) {
        where.price = {
            ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
            ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {})
        };
    }
    if (query.location) {
        where.technician = {
            location: { contains: query.location, mode: "insensitive" }
        };
    }
    const [services, total] = await Promise.all([
        prisma.service.findMany({
            where,
            include: {
                category: true,
                technician: { include: { user: { select: { id: true, name: true } } } }
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.service.count({ where })
    ]);
    return { services, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
};
const getAllTechnicians = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const where = {};
    if (query.location) {
        where.location = { contains: query.location, mode: "insensitive" };
    }
    if (query.minRating) {
        where.avgRating = { gte: parseFloat(query.minRating) };
    }
    const [technicians, total] = await Promise.all([
        prisma.technicianProfile.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                services: true
            },
            skip,
            take: limit,
            orderBy: { avgRating: "desc" }
        }),
        prisma.technicianProfile.count({ where })
    ]);
    return { technicians, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
};
const getTechnicianById = async (id) => {
    const technician = await prisma.technicianProfile.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true } },
            services: { include: { category: true } },
            reviews: {
                include: { customer: { select: { id: true, name: true } } },
                orderBy: { createdAt: "desc" }
            }
        }
    });
    if (!technician) {
        throw new Error("Technician not found");
    }
    return technician;
};
const getAllCategories = async () => {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
};
// ---------- Bookings ----------
const createBooking = async (customerId, payload) => {
    const service = await prisma.service.findUnique({ where: { id: payload.serviceId } });
    if (!service) {
        throw new Error("Service not found");
    }
    return prisma.booking.create({
        data: {
            customerId,
            technicianId: service.technicianId,
            serviceId: service.id,
            scheduledAt: new Date(payload.scheduledAt),
            address: payload.address,
            notes: payload.notes,
            totalAmount: service.price,
            status: "REQUESTED"
        },
        include: { service: true }
    });
};
const getMyBookings = async (customerId, query) => {
    const { page, limit, skip } = getPagination(query);
    const where = { customerId };
    if (query.status)
        where.status = query.status;
    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                service: true,
                technician: { include: { user: { select: { id: true, name: true } } } },
                payment: true
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.booking.count({ where })
    ]);
    return { bookings, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
};
const getBookingById = async (customerId, id) => {
    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            service: true,
            technician: { include: { user: { select: { id: true, name: true } } } },
            payment: true,
            review: true
        }
    });
    if (!booking) {
        throw new Error("Booking not found");
    }
    if (booking.customerId !== customerId) {
        throw new Error("You do not have access to this booking");
    }
    return booking;
};
const cancelBooking = async (customerId, id) => {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
        throw new Error("Booking not found");
    }
    if (booking.customerId !== customerId) {
        throw new Error("You do not have access to this booking");
    }
    if (["IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(booking.status)) {
        throw new Error(`Booking cannot be cancelled once it is ${booking.status}`);
    }
    return prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED" }
    });
};
// ---------- Reviews ----------
const createReview = async (customerId, payload) => {
    const booking = await prisma.booking.findUnique({
        where: { id: payload.bookingId },
        include: { review: true }
    });
    if (!booking) {
        throw new Error("Booking not found");
    }
    if (booking.customerId !== customerId) {
        throw new Error("You can only review your own bookings");
    }
    if (booking.status !== "COMPLETED") {
        throw new Error("You can only review a completed job");
    }
    if (booking.review) {
        throw new Error("This booking has already been reviewed");
    }
    return prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                bookingId: booking.id,
                customerId,
                technicianId: booking.technicianId,
                rating: payload.rating,
                comment: payload.comment
            }
        });
        const agg = await tx.review.aggregate({
            where: { technicianId: booking.technicianId },
            _avg: { rating: true },
            _count: { rating: true }
        });
        await tx.technicianProfile.update({
            where: { id: booking.technicianId },
            data: {
                avgRating: agg._avg.rating ?? payload.rating,
                totalReviews: agg._count.rating
            }
        });
        return review;
    });
};
export const customerService = {
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
