import { PrismaClient } from "@prisma/client";
import { v1 } from "./router"
import { startServer } from "./config";
import { config } from "dotenv";
config();


const prisma = new PrismaClient();

async function main() { }

main()
  .then(async () => {
    // await connectDB();

    startServer(v1, () => {
      console.log("Server started");
    });

    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
