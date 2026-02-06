import { Router } from "express";
import authentication from "../../middleware/authentication.js";
import BookingController from "./booking.controller.js";

const router = Router();

router.use(authentication("STUDENT"));

// Student Routes
router.post("/", authentication("STUDENT"), BookingController.createBooking);

router.get(
  "/student",
  authentication("STUDENT"),
  BookingController.getBookingsByStudent,
);

// Tutor Routes
router.get(
  "/tutor",
  authentication("TUTOR"),
  BookingController.getBookingsByTutor,
);

// Common Routes
router.get(
  "/:id",
  authentication("STUDENT", "TUTOR"),
  BookingController.getBookingById,
);

router.patch(
  "/status/:id",
  authentication("STUDENT", "TUTOR"),
  BookingController.updateBookingStatus,
);

router.delete(
  "/:id",
  authentication("STUDENT", "TUTOR"),
  BookingController.deleteBooking,
);

export default router;
