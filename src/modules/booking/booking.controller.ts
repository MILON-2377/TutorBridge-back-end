import { Request, Response } from "express";
import asyncHandler from "../../utils/AsyncHandler.js";
import BookingService from "./booking.service.js";
import { BookingStatus } from "@prisma/client";
import ApiError from "../../utils/ApiError.js";

export default class BookingController {
  // Create a new booking
  public static createBooking = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req?.user?.id;
    const { tutorId, availabilitySlotId, price } = req.body;

    if (!studentId) throw ApiError.forbidden("Student not authenticated");

    const booking = await BookingService.createBooking(studentId, tutorId, availabilitySlotId, price);
    return res.status(booking.statusCode).json(booking);
  });

  // Get all bookings of a student
  public static getBookingsByStudent = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req?.user?.id;
    if (!studentId) throw ApiError.forbidden("Student not authenticated");

    const bookings = await BookingService.getBookingsByStudent(studentId);
    return res.status(bookings.statusCode).json(bookings);
  });

  // Get all bookings of a tutor
  public static getBookingsByTutor = asyncHandler(async (req: Request, res: Response) => {
    const tutorId = req?.user?.id;
    if (!tutorId) throw ApiError.forbidden("Tutor not authenticated");

    const bookings = await BookingService.getBookingsByTutor(tutorId);
    return res.status(bookings.statusCode).json(bookings);
  });

  // Get single booking by ID
  public static getBookingById = asyncHandler(async (req: Request, res: Response) => {
    const bookingId = req.params.id;
    if (!bookingId) throw ApiError.badRequest("Booking ID is required");

    const booking = await BookingService.getBookingById(bookingId as string);
    return res.status(booking.statusCode).json(booking);
  });

  // Update booking status
  public static updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
    const bookingId = req.params.id;
    const { status, cancelledBy } = req.body;

    if (!bookingId) throw ApiError.badRequest("Booking ID is required");

    if (!Object.values(BookingStatus).includes(status)) {
      throw ApiError.badRequest("Invalid booking status");
    }

    const updatedBooking = await BookingService.updateBookingStatus(bookingId as string, status, cancelledBy);
    return res.status(updatedBooking.statusCode).json(updatedBooking);
  });

  // Delete a booking
  public static deleteBooking = asyncHandler(async (req: Request, res: Response) => {
    const bookingId = req.params.id;
    if (!bookingId) throw ApiError.badRequest("Booking ID is required");

    const response = await BookingService.deleteBooking(bookingId as string);
    return res.status(response.statusCode).json(response);
  });
}
