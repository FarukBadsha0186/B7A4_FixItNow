"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.default = {
    port: process.env.PORT || 5000,
    database_url: process.env.DATABASE_URL,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET || "your-secret-key",
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || "your-refresh-key",
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    node_env: process.env.NODE_ENV || "development",
    client_url: process.env.CLIENT_URL || "http://localhost:3000",
    admin_email: process.env.ADMIN_EMAIL || "admin@fixitnow.com",
    admin_password: process.env.ADMIN_PASSWORD || "admin123",
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    client_success_url: process.env.CLIENT_SUCCESS_URL || "http://localhost:3000/payment/success",
    client_cancel_url: process.env.CLIENT_CANCEL_URL || "http://localhost:3000/payment/cancel",
};
