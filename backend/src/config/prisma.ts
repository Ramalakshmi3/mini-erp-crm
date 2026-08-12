import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({
  adapter,
});

export async function connectDatabase() {
  await prisma.$connect();
  console.log("✅ Database connected");
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}