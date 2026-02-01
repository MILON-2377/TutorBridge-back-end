import "./config/index.js";
import app from "./app.js";
import config from "./config/index.js";
import prisma from "./lib/prisma.js";

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    // Additional server startup logic can go here
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Error starting the server: ", error);
  }
};

start();
