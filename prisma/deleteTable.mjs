// Deletes all entries in a specific table
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  try {
    // Use Prisma to delete all records from the Intent table
    // modify to delete other tables
    await prisma.intent.deleteMany({});

    console.log("All data from the Intent table has been deleted.");
  } catch (error) {
    console.error("Error deleting data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

await main();
