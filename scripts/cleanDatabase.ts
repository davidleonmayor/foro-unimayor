import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    // Eliminar todos los datos de las tablas
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("Database cleaned successfully");
    // eslint-disable-next-line brace-style
  } catch (error) {
    console.error("Error cleaning database:", error);
    // eslint-disable-next-line brace-style
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
