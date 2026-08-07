
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { IListQuery, ICreateBooking, ICreateReview } from "./customer.interface";

const getPagination = (query: IListQuery) => {
    const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit || "10", 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

//  Public browse 


// const getAllServices = async (query: IListQuery) => {
//     const { page, limit, skip } = getPagination(query);

//     const where: Record<string, unknown> = {};

//     // "type" filter — maps to categoryId (category IS the service type: plumbing, electrical, etc.)
//     if (query.categoryId) where.categoryId = query.categoryId;

//     if (query.minPrice || query.maxPrice) {
//         where.price = {
//             ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
//             ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {})
//         };
//     }

//     // "location" filter — via the technician offering the service
//     // "rating" filter — via the technician's average rating
//     const technicianFilter: Record<string, unknown> = {};
//     if (query.location) {
//         technicianFilter.location = { contains: query.location, mode: "insensitive" };
//     }
//     if (query.minRating) {
//         technicianFilter.avgRating = { gte: parseFloat(query.minRating) };
//     }
//     if (Object.keys(technicianFilter).length > 0) {
//         where.technician = technicianFilter;
//     }

//     const [services, total] = await Promise.all([
//         prisma.service.findMany({
//             where,
//             include: {
//                 category: true,
//                 technician: { include: { user: { select: { id: true, name: true } } } }
//             },
//             skip,
//             take: limit,
//             orderBy: { createdAt: "desc" }
//         }),
//         prisma.service.count({ where })
//     ]);

//     return { services, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
// };

const getAllServices = async (query: IListQuery) => {
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = {};

    if (query.categoryId) where.categoryId = query.categoryId;

    if (query.minPrice || query.maxPrice) {
        where.price = {
            ...(query.minPrice ? { gte: parseFloat(query.minPrice) } : {}),
            ...(query.maxPrice ? { lte: parseFloat(query.maxPrice) } : {})
        };
    }

    const technicianFilter: Record<string, unknown> = {};
    if (query.location) {
        technicianFilter.location = { contains: query.location, mode: "insensitive" };
    }
    if (query.minRating) {
        technicianFilter.avgRating = { gte: parseFloat(query.minRating) };
    }
    if (Object.keys(technicianFilter).length > 0) {
        where.technician = technicianFilter;
    }

    // ✅ ADD SEARCH - NEW
    if (query.search) {
        where.OR = [
            { title: { contains: query.search, mode: "insensitive" } },
            { technician: { user: { name: { contains: query.search, mode: "insensitive" } } } }
        ];
    }

    const [services, total] = await Promise.all([
        prisma.service.findMany({
            where,
            include: {
                category: true,
                technician: { 
                    include: { 
                        user: { select: { id: true, name: true, image: true } } 
                    } 
                }
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.service.count({ where })
    ]);

    return { services, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
};


const getAllTechnicians = async (query: IListQuery) => {
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = {};
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

const getTechnicianById = async (id: string) => {
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

//  Bookings 


// const createBooking = async (customerId: string, payload: ICreateBooking) => {
//     // Input validation
//     if (!payload.serviceId || typeof payload.serviceId !== "string") {
//         throw new Error("serviceId is required");
//     }
//     if (!payload.scheduledAt || isNaN(Date.parse(payload.scheduledAt))) {
//         throw new Error("scheduledAt must be a valid date");
//     }
//     if (new Date(payload.scheduledAt) < new Date()) {
//         throw new Error("scheduledAt must be a future date");
//     }
//     if (!payload.address || payload.address.trim().length < 5) {
//         throw new Error("address is required and must be at least 5 characters");
//     }

//     const service = await prisma.service.findUnique({ where: { id: payload.serviceId } });

//     if (!service) {
//         throw new Error("Service not found");
//     }

//     return prisma.booking.create({
//         data: {
//             customerId,
//             technicianId: service.technicianId,
//             serviceId: service.id,
//             scheduledAt: new Date(payload.scheduledAt),
//             address: payload.address,
//             notes: payload.notes,
//             totalAmount: service.price,
//             status: "REQUESTED"
//         },
//         include: { service: true }
//     });
// };


const getMyBookings = async (customerId: string, query: IListQuery) => {
    const { page, limit, skip } = getPagination(query);

    const where: Record<string, unknown> = { customerId };
    if (query.status) where.status = query.status;

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

const getBookingById = async (customerId: string, id: string) => {
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

const cancelBooking = async (customerId: string, id: string) => {
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

//  Reviews 

const createReview = async (customerId: string, payload: ICreateReview) => {
    // Input validation
    if (!payload.bookingId || typeof payload.bookingId !== "string") {
        throw new Error("bookingId is required");
    }
    if (
        payload.rating === undefined ||
        typeof payload.rating !== "number" ||
        payload.rating < 1 ||
        payload.rating > 5
    ) {
        throw new Error("rating is required and must be a number between 1 and 5");
    }

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

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

// ✅ NEW: Check technician availability
const checkTechnicianAvailability = async (technicianId: string, scheduledAt: Date) => {
    const dayOfWeek = new Date(scheduledAt).getDay(); // 0=Sunday
    const time = scheduledAt.toTimeString().slice(0, 5); // "HH:MM"

    // 1. Check if technician has availability slot for this day and time
    const availability = await prisma.availability.findFirst({
        where: {
            technicianId: technicianId,
            dayOfWeek: dayOfWeek,
            AND: [
                { startTime: { lte: time } },
                { endTime: { gte: time } }
            ]
        }
    });

    if (!availability) {
        throw new Error(`Technician is not available at ${time} on this day`);
    }

    // 2. Check if already booked (overlap)
    const existingBooking = await prisma.booking.findFirst({
        where: {
            technicianId: technicianId,
            scheduledAt: scheduledAt,
            status: { 
                notIn: ['CANCELLED', 'DECLINED', 'COMPLETED'] 
            }
        }
    });

    if (existingBooking) {
        throw new Error("This time slot is already booked");
    }

    return true;
};

// ✅ UPDATED: Create Booking with availability check
const createBooking = async (customerId: string, payload: ICreateBooking) => {
    // Input validation
    if (!payload.serviceId || typeof payload.serviceId !== "string") {
        throw new Error("serviceId is required");
    }
    if (!payload.scheduledAt || isNaN(Date.parse(payload.scheduledAt))) {
        throw new Error("scheduledAt must be a valid date");
    }
    
    const scheduledDate = new Date(payload.scheduledAt);
    if (scheduledDate < new Date()) {
        throw new Error("scheduledAt must be a future date");
    }
    if (!payload.address || payload.address.trim().length < 5) {
        throw new Error("address is required and must be at least 5 characters");
    }

    // Get service with technician
    const service = await prisma.service.findUnique({ 
        where: { id: payload.serviceId },
        include: { technician: true }
    });

    if (!service) {
        throw new Error("Service not found");
    }

    // ✅ CHECK AVAILABILITY BEFORE CREATING BOOKING
    await checkTechnicianAvailability(service.technicianId, scheduledDate);

    // Create booking
    return prisma.booking.create({
        data: {
            customerId,
            technicianId: service.technicianId,
            serviceId: service.id,
            scheduledAt: scheduledDate,
            address: payload.address,
            notes: payload.notes || null,
            totalAmount: service.price,
            status: "REQUESTED"
        },
        include: { 
            service: true,
            technician: {
                include: { user: { select: { id: true, name: true } } }
            }
        }
    });
};

// ✅ NEW: Get available slots for a technician
const getAvailableSlots = async (technicianId: string, date: string) => {
    const dayOfWeek = new Date(date).getDay();
    
    // Get technician's availability for that day
    const availability = await prisma.availability.findMany({
        where: {
            technicianId: technicianId,
            dayOfWeek: dayOfWeek
        },
        orderBy: { startTime: 'asc' }
    });

    if (availability.length === 0) {
        return { availableSlots: [], message: "No availability set for this day" };
    }

    // Get already booked slots for that day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
        where: {
            technicianId: technicianId,
            scheduledAt: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: { 
                notIn: ['CANCELLED', 'DECLINED', 'COMPLETED'] 
            }
        }
    });

    const bookedTimes = bookings.map(b => 
        b.scheduledAt.toTimeString().slice(0, 5)
    );

    // Generate available slots (30 min intervals)
    const availableSlots = [];
    for (const slot of availability) {
        let current = slot.startTime;
        while (current < slot.endTime) {
            if (!bookedTimes.includes(current)) {
                availableSlots.push(current);
            }
            // Add 30 minutes
            const [hours, minutes] = current.split(':').map(Number);
            const newMinutes = minutes + 30;
            if (newMinutes >= 60) {
                current = `${String(hours + 1).padStart(2, '0')}:${String(newMinutes - 60).padStart(2, '0')}`;
            } else {
                current = `${String(hours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
            }
        }
    }

    return {
        technicianId,
        date,
        dayOfWeek,
        availableSlots,
        bookedTimes,
        totalSlots: availableSlots.length
    };
};



// ✅ Add this function
const getCategoryById = async (id: string) => {
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            services: {
                include: {
                    technician: {
                        include: {
                            user: { select: { id: true, name: true, email: true } }
                        }
                    }
                }
            }
        }
    });

    if (!category) {
        throw new Error("Category not found");
    }

    return category;
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
    createReview,
    getAvailableSlots,  
    checkTechnicianAvailability, 
    getCategoryById,

};