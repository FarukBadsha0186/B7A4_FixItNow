// // import app from "./app";
// // import { config } from "./config";

// // import { prisma } from "./lib/prisma";
// // import "dotenv/config";

// // const PORT = config.PORT;

// // async function main() {
// //   try {
// //     await prisma.$connect();
// //     console.log("Connected to database successfully");
// //     app.listen(PORT, () => {
// //       console.log(`Server is running on ${PORT}`);
// //     });
// //   } catch (error) {
// //     console.log("Error starting server:", error);
// //     await prisma.$disconnect();
// //     process.exit(1);
// //   }
// // }

// // main();


// // src/server.ts
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";


// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors({
//     origin: process.env.CLIENT_URL || "http://localhost:3000",
//     credentials: true
// }));
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// // app.use("/api/admin", adminRouter);
// // app.use("/api/auth", checkAuth);



// app.get("/", (req, res) => {
//     res.send("API is running");
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const PORT = config.port;

async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to database successfully");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log("Error starting server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();