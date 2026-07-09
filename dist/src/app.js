"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_1 = __importDefault(require("./config/index"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const admin_routes_1 = require("./modules/admin/admin.routes");
const technician_routes_1 = require("./modules/technician/technician.routes");
const customer_routes_1 = require("./modules/customer/customer.routes");
const payment_routes_1 = require("./modules/payment/payment.routes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: index_1.default.client_url,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "FixItNow API is healthy",
        data: null
    });
});
// Module routes
app.use("/api/auth", auth_routes_1.authRoutes);
app.use("/api/admin", admin_routes_1.adminRoutes);
app.use("/api/technician", technician_routes_1.technicianRoutes);
app.use("/api/customer", customer_routes_1.customerRoutes);
// app.use("/api", serviceRoutes);
// app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", payment_routes_1.paymentRoutes);
// app.use("/api/reviews", reviewRoutes);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        errorDetails: null
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error",
        errorDetails: err.errorDetails || null
    });
});
exports.default = app;
