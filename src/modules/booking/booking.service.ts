import { BookingStatus, Prisma, SlotStatus } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { UpdateBookingStatusInput } from "./booking.validation.js";

export default class BookingService {
  // Create Booking for a student
  public static createBooking = async (
    studentId: string,
    tutorId: string,
    availabilitySlotId: string,
    price: number,
  ) => {
    const slot = await prisma.availabilitySlot.findUnique({
      where: {
        id: availabilitySlotId,
      },
      include: {
        availabilityRule: true,
      },
    });

    console.log({ slot });

    if (!slot) {
      throw ApiError.notFound("Availability slot not found");
    }

    if (slot.status !== "AVAILABLE") {
      throw ApiError.badRequest("Slot is not available for booking");
    }

    if (slot.availabilityRule.tutorId !== tutorId) {
      throw ApiError.badRequest("Slot does not belong to this tutor");
    }

    const booking = await prisma.booking.create({
      data: {
        studentId,
        tutorId,
        availabilitySlotId,
        price,
        status: BookingStatus.PENDING,
      },
      include: {
        availabilitySlot: true,
        tutor: true,
        student: true,
      },
    });

    await prisma.availabilitySlot.update({
      where: { id: availabilitySlotId },
      data: { status: SlotStatus.BOOKED },
    });

    return ApiResponse.success("Booking created successfully", booking);
  };

  /**
   * Get bookings by student
   */
  public static getBookingsByStudent = async (
    studentId: string,
    type: "upcoming" | "past" | "all",
  ) => {
    try {
      const now = new Date();
      const currentMinute = now.getHours() * 60 + now.getMinutes();

      const where: Prisma.BookingWhereInput = {
        studentId,
      };

      if (type === "upcoming") {
        where.status = {
          in: ["PENDING", "CONFIRMED"],
        };

        where.availabilitySlot = {
          OR: [
            {
              date: {
                gt: now,
              },
            },
            {
              date: {
                equals: now,
              },
              endMinute: {
                gt: currentMinute,
              },
            },
          ],
        };
      }

      if (type === "past") {
        where.OR = [
          {
            status: {
              in: ["COMPLETED", "CANCELLED"],
            },
          },
          {
            availabilitySlot: {
              OR: [
                {
                  date: {
                    lt: now,
                  },
                },
                {
                  date: {
                    equals: now,
                  },
                  endMinute: {
                    lte: currentMinute,
                  },
                },
              ],
            },
          },
        ];
      }

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          tutor: true,
          availabilitySlot: true,
        },
        orderBy: {
          availabilitySlot: {
            date: "asc",
          },
        },
      });

      return ApiResponse.success("Bookings fetched successfully", bookings);
    } catch (error) {
      throw ApiError.error("Get student bookings error");
    }
  };

  /**
   * Get bookings by tutor
   */
  public static getBookingsByTutor = async (tutorId: string) => {
    const bookings = await prisma.booking.findMany({
      where: { tutorId },
      include: { student: true, availabilitySlot: true },
      orderBy: { createdAt: "desc" },
    });

    return ApiResponse.success("Bookings fetched successfully", bookings);
  };

  /**
   * Update booking status
   */
  public static updateBookingStatus = async (
    bookingId: string,
    data: UpdateBookingStatusInput,
  ) => {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw ApiError.notFound("Booking not found");

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: data.status,
        cancelledBy:
          data.status === BookingStatus.CANCELLED ? data.cancelledBy : null,
      },
    });

    // Update slot status
    if (data.status === BookingStatus.CANCELLED) {
      await prisma.availabilitySlot.update({
        where: { id: booking.availabilitySlotId },
        data: { status: SlotStatus.AVAILABLE },
      });
    }

    return ApiResponse.success("Booking status updated", updatedBooking);
  };

  /**
   * Get single booking details
   */
  public static getBookingById = async (bookingId: string) => {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: true,
        tutor: true,
        availabilitySlot: true,
        review: true,
      },
    });

    if (!booking) throw ApiError.notFound("Booking not found");

    return ApiResponse.success("Booking fetched successfully", booking);
  };

  /**
   * Delete a booking
   */
  public static deleteBooking = async (bookingId: string) => {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw ApiError.notFound("Booking not found");

    await prisma.booking.delete({ where: { id: bookingId } });

    // Update slot status back to AVAILABLE
    await prisma.availabilitySlot.update({
      where: { id: booking.availabilitySlotId },
      data: { status: SlotStatus.AVAILABLE },
    });

    return ApiResponse.success("Booking deleted successfully", null);
  };
}
