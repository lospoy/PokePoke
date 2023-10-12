// Deletes all files created today in a specific db model

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDataSavedToday() {
  try {
    // Calculate the start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set to the beginning of the next day

    // Use Prisma Client to find and delete records created on the date specified above
    // Replace ".intent" with any other model that needs a file deletion
    const deletedRecords = await prisma.intent.deleteMany({
      where: {
        createdOn: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    console.log(`Deleted ${deletedRecords.count} records created today.`);
  } catch (error) {
    console.error("Error clearing data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDataSavedToday();
