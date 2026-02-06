import { Request, Response } from "express";
import asyncHandler from "../../utils/AsyncHandler.js";
import { ReviewSchema } from "./review.validation.js";
import ReviewService from "./review.service.js";
import ApiError from "../../utils/ApiError.js";

export default class ReviewController {
  //   Give review
  public static createReview = asyncHandler(
    async (req: Request, res: Response) => {
      const studentId = req?.user?.id;
      const bookingId = req.params.id;

      const rawData = req.body;

      if (!studentId) {
        throw ApiError.unauthorized("Unauthorized: invalid credentials");
      }

      const validatedReviewData = ReviewSchema.parse(rawData);

      const response = await ReviewService.createReview(
        studentId,
        bookingId as string,
        validatedReviewData,
      );

      return res.status(response.statusCode).json(response);
    },
  );

  // Get reviews by studentId
  public static getReviewsByStudentId = asyncHandler(
    async (req: Request, res: Response) => {
      const studentId = req?.user?.id;

      if (!studentId) {
        throw ApiError.unauthorized("Invalid credentials");
      }

      const response = await ReviewService.getReviewsByStudentId(studentId);

      return res.status(response.statusCode).json(response);
    },
  );
}
