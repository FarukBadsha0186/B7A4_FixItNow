import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("FATAL: DATABASE_URL environment variable is not set.");
}

const adapter = new PrismaPg({ connectionString: connectionString || "" });
const prisma = new PrismaClient({ adapter });

export { prisma };