import { PrismaClient } from "../generated/prisma/index.js";

// Create a single PrismaClient instance
const prisma = new PrismaClient();

// Export the instance to be used elsewhere
export default prisma;
async function testPrisma() {
  try {
    // Try to fetch all users from the database
    const users = await prisma.user.findMany();

    console.log("Users fetched from DB:", users);
  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    // Disconnect Prisma client after query to prevent hanging
    await prisma.$disconnect();
  }
}

testPrisma();
