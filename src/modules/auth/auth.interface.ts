
// // modules/auth/auth.interface.ts
// import { Role } from "../../../generated/prisma/enums";

// export interface IRegisterUser {
//     name: string;
//     email: string;
//     password: string;
//     phone?: string;
//     role?: Role;
// }

// export interface ILoginUser {
//     email: string;
//     password: string;
// }

// export interface IRefreshTokenInput {
//     refreshToken: string;
// }

// export interface IAuthResponse {
//     accessToken: string;
//     refreshToken: string;
//     user: {
//         id: string;
//         name: string;
//         email: string;
//         phone: string | null;
//         role: Role;
//         activeStatus: string;
//     };
// }

// export interface IUserResponse {
//     id: string;
//     name: string;
//     email: string;
//     phone: string | null;
//     role: Role;
//     activeStatus: string;
//     createdAt: Date;
//     updatedAt: Date;
// }

import { Role } from "@prisma/client";

export interface IRegisterUser {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role; // only CUSTOMER or TECHNICIAN accepted at registration
}

export interface ILoginUser {
    email: string;
    password: string;
}