import { PrismaClient, Role, UserStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fixitnow.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = "Super Admin";

async function main() {
    const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (existingAdmin) {
        console.log("Admin already exists, skipping.");
        return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await prisma.user.create({
        data: {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: Role.ADMIN,
            status: UserStatus.ACTIVE
        }
    });

    console.log(`Admin created -> ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });