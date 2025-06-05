import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("Prisma connected to the database successfully!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Optional: exit app if DB fails
  }
}

export { prisma };
