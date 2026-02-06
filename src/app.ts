import express from "express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import ErrorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import auth from "./lib/auth.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: `${config.cors_origin}`,
    credentials: true,
  }),
);

// Bettet Auth Route
app.all("/api/auth/*splat", toNodeHandler(auth));

// Auth Route
import authRoute from "./modules/auth/auth.routes.js";
app.use("/api/v1/auth", authRoute);

// User Route
import userRoute from "./modules/user/user.routes.js";
app.use("/api/v1/users", userRoute);

// Booking Route
import bookingRoute from "./modules/booking/booking.routes.js";
app.use("/api/v1/bookings", bookingRoute);

// Student Route
import studentRoute from "./modules/student/student.routes.js";
app.use("/api/v1/students", studentRoute);

// Category Route
import categoryRoute from "./modules/category/category.routes.js";
app.use("/api/v1/categories", categoryRoute);

// Review Route
import reviewRoute from "./modules/review/review.routes.js";
app.use("/api/v1/reviews", reviewRoute);

// Tutor Route
import tutorRoute from "./modules/tutor/tutor.routes.js";
import config from "./config/index.js";
app.use("/api/v1/tutors", tutorRoute);

app.get("/", (req, res) => {
  res.send("Server, Ok!");
});

// error handler
app.use(ErrorHandler.errorHandler);

export default app;
