import { Router } from "express";
import authentication from "../../middleware/authentication.js";
import BookingController from "./booking.controller.js";

const router = Router();

// ----------------------
// STUDENT ROUTES
// ----------------------

// Create a new booking (only students)
router.post(
  "/",
  authentication("STUDENT"),
  BookingController.createBooking
);

// Get all bookings of the logged-in student
router.get(
  "/student",
  authentication("STUDENT"),
  BookingController.getBookingsByStudent
);

// ----------------------
// TUTOR ROUTES
// ----------------------

// Get all bookings of the logged-in tutor
router.get(
  "/tutor",
  authentication("TUTOR"),
  BookingController.getBookingsByTutor
);

// ----------------------
// COMMON ROUTES
// ----------------------

// Get a single booking by ID (student or tutor)
router.get(
  "/:id",
  authentication("STUDENT", "TUTOR"),
  BookingController.getBookingById
);

// Update booking status (student or tutor, depending on role)
router.patch(
  "/:id/status",
  authentication("STUDENT", "TUTOR"),
  BookingController.updateBookingStatus
);

// Delete a booking (student or tutor, depending on role)
router.delete(
  "/:id",
  authentication("STUDENT", "TUTOR"),
  BookingController.deleteBooking
);

export default router;
