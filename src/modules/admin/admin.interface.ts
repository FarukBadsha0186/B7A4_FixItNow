import { UserStatus } from "@prisma/client";

export interface IUpdateUserStatus {
    status: UserStatus; // "ACTIVE" | "BANNED"
}

export interface ICreateCategory {
    name: string;
    description?: string;
}

export interface IListQuery {
    page?: string;
    limit?: string;
    status?: string;
    role?: string;
}