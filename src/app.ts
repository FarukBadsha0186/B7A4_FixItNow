

import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";
import { authRoutes } from "./modules/auth/auth.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import { technicianRoutes } from "./modules/technician/technician.routes";
import { customerRoutes } from "./modules/customer/customer.routes";
import { paymentRoutes } from "./modules/payment/payment.routes";
import { paymentController } from "./modules/payment/payment.controller";

const app: Application = express();

app.use(cors({
    origin: config.client_url,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "FixItNow API is healthy",
        data: null
    });
});

// Module routes
app.use("/api/auth", authRoutes);
 app.use("/api/admin", adminRoutes);
 app.use("/api/technician", technicianRoutes);
 app.use("/api/customer", customerRoutes);
// app.use("/api", serviceRoutes);
// app.use("/api/bookings", bookingRoutes);
 app.use("/api/payments", paymentRoutes);
// app.use("/api/reviews", reviewRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        errorDetails: null
    });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error",
        errorDetails: err.errorDetails || null
    });
});

export default app;