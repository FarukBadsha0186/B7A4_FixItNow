import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";
const getPagination = (query) => {
    const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit || "10", 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
const getAllUsers = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const where = {};
    if (query.role)
        where.role = query.role;
    if (query.status)
        where.status = query.status;
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true, name: true, email: true, phone: true,
                role: true, status: true, createdAt: true
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }
        }),
        prisma.user.count({ where })
    ]);
    return {
        users,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
    };
};
const updateUserStatus = async (id, payload) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role === Role.ADMIN) {
        throw new Error("Cannot change status of an admin account");
    }
    const updatedUser = await prisma.user.update({
        where: { id },
        data: { status: payload.status },
        select: {
            id: true, name: true, email: true, phone: true,
            role: true, status: true, createdAt: true, updatedAt: true
        }
    });
    return updatedUser;
};
const getAllBookings = async (query) => {
    const { page, limit, skip } = getPagination(query);
    const where = {};
    if (query.status)
        where.status = query.status;
    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                customer: { select: { id: true, name: true, email: true } },
                technician: { include: { user: { select: { id: true, name: true } } } },
                service: true,
                payment: true
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
const getAllCategories = async () => {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
};
const createCategory = async (payload) => {
    const existing = await prisma.category.findUnique({ where: { name: payload.name } });
    if (existing) {
        throw new Error("A category with this name already exists");
    }
    return prisma.category.create({ data: payload });
};
export const adminService = {
    getAllUsers,
    updateUserStatus,
    getAllBookings,
    getAllCategories,
    createCategory
};
