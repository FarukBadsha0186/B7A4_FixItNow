

import { Role } from "@prisma/client";

export interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role; 
}

export interface ILoginUser {
    email: string;
    password: string;
    role?: Role;
}