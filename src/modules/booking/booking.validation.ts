import { z } from "zod";

export const BookingSchema = z.object({
  tutorId: z.string().uuid("Invalid tutor id"),
  availabilitySlotId: z.string().uuid("Invalid availability slot id"),
  price: z.number().positive("Price must be greater than 0"),
});

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"]),
  cancelledBy: z.enum(["STUDENT", "TUTOR", "ADMIN"]).optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;
export type UpdateBookingStatusInput = z.infer<
  typeof UpdateBookingStatusSchema
>;
