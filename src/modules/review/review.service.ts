import { BookingStatus } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { ReviewInput } from "./review.validation.js";
import ApiResponse from "../../utils/ApiResponse.js";

export default class ReviewService {
  // Get Reviews By StudentId
  public static getReviewsByStudentId = async (studentId: string) => {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          booking: {
            studentId: studentId,
          },
        },
        include: {
          booking: {
            select: {
              id: true,
              tutorId: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return ApiResponse.success("Reviews fetched successfully", reviews);
    } catch (error) {
      throw ApiError.error("Get reviews by stutendID error");
    }
  };

  // Get Reviews By TutorId
  public static getReviewsByTutorId = async (tutorId: string) => {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          booking: {
            tutorId,
          },
        },
        include: {
          booking: {
            select: {
              id: true,
              student: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return ApiResponse.success("Reviews fetched successfully", reviews);
    } catch (error) {
      throw ApiError.error("Get revies by tutorId error");
    }
  };

  // Submit Review
  public static createReview = async (
    studentId: string,
    bookingId: string,
    data: ReviewInput,
  ) => {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          studentId,
          status: BookingStatus.COMPLETED,
        },
        include: {
          review: true,
        },
      });

      if (!booking) {
        throw ApiError.notFound("Booking not found or completed");
      }

      const review = await prisma.review.findUnique({
        where: {
          bookingId,
        },
      });

      if (review) {
        throw ApiError.badRequest(
          "You can not submit multiple reviews on same session",
        );
      }

      const newReview = await prisma.review.create({
        data: {
          bookingId,
          rating: data.rating,
          comment: data.comment ?? null,
        },
      });

      return ApiResponse.created(newReview, "Review submitted successfully");
    } catch (error) {
      throw ApiError.error("Give review error");
    }
  };
  
}
