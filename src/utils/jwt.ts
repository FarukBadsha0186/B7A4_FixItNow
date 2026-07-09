// // src/utils/jwt.ts
// import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

// export const jwtUtils = {
    
//     generateToken: (payload: object, secret: string, expiresIn: string = "7d"): string => {
//         try {
//             const options: SignOptions = {
//                 expiresIn: expiresIn as any 
//             };
//             return jwt.sign(payload, secret, options);
//         } catch (error) {
//             console.error('Error generating token:', error);
//             throw new Error('Failed to generate token');
//         }
//     },

//     verifyToken: (token: string, secret: string): { success: boolean; data?: JwtPayload; error?: string } => {
//         try {
//             const decoded = jwt.verify(token, secret) as JwtPayload;
//             return { success: true, data: decoded };
//         } catch (error: any) {
//             console.error('Token verification error:', error.message);
//             return { 
//                 success: false, 
//                 error: error.message || 'Invalid token' 
//             };
//         }
//     },

//     // Optional: Generate refresh token
//     generateRefreshToken: (payload: object, secret: string, expiresIn: string = "30d"): string => {
//         try {
//             const options: SignOptions = {
//                 expiresIn: expiresIn as any
//             };
//             return jwt.sign(payload, secret, options);
//         } catch (error) {
//             console.error('Error generating refresh token:', error);
//             throw new Error('Failed to generate refresh token');
//         }
//     },

//     // Optional: Decode token without verification
//     decodeToken: (token: string): JwtPayload | null => {
//         try {
//             return jwt.decode(token) as JwtPayload;
//         } catch (error) {
//             console.error('Error decoding token:', error);
//             return null;
//         }
//     }
// };


import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const createToken = (
    payload: object,
    secret: Secret,
    expiresIn: string
): string => {
    return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

const verifyToken = (
    token: string,
    secret: Secret
): { success: boolean; data?: JwtPayload; error?: string } => {
    try {
        const data = jwt.verify(token, secret) as JwtPayload;
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Invalid token"
        };
    }
};

const decodeToken = (token: string): JwtPayload | null => {
    return jwt.decode(token) as JwtPayload | null;
};

export const jwtUtils = {
    createToken,
    verifyToken,
    decodeToken
};