import "./config/index.js";
import app from "./app.js";
import config from "./config/index.js";
import prisma from "./lib/prisma.js";

const port = config.port;

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server: ", error);
  }
};

start();
