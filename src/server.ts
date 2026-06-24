import app from "./app";
// import { prisma } from "./lib/prisma";
import "dotenv/config";

const port = process.env.PORT;

async function main() {
  try {
    // await prisma.$connect();
    // console.log("Database connected succesfully");
    app.listen(port, () => {
      console.log(`Server running on port : ${port}`);
    });
  } catch (error) {
    console.log("Error starting the server", error);
    // await prisma.$disconnect();
    process.exit(1);
  }
}

main();
