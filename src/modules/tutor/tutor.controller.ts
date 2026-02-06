import { Request, Response } from "express";
import asyncHandler from "../../utils/AsyncHandler.js";
import {
  AvailabilityRuleSchema,
  CreateTutorSchema,
  UpdateAvailabilitySchema,
} from "./tutor.validation.js";
import TutorService from "./tutor.service.js";
import ApiError from "../../utils/ApiError.js";
import prisma from "../../lib/prisma.js";

export default class TutorController {
  public static createTutor = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req?.user?.id;

      const rawData = req.body;

      if (!userId) {
        throw ApiError.badRequest("UserId not found or invalid credentials");
      }

      const validatedTutorData = CreateTutorSchema.parse(rawData);

      const response = await TutorService.createTutor(
        validatedTutorData,
        userId,
      );

      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Get All Tutors (Paginated)
   */
  public static getTutors = asyncHandler(
    async (req: Request, res: Response) => {
      const response = await TutorService.getTutors(req.query as any);
      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Get Tutor by ID
   */
  public static getTutorById = asyncHandler(
    async (req: Request, res: Response) => {
      const tutorId = req.params.id;

      if (!tutorId) {
        throw ApiError.badRequest("TutorId is required");
      }

      const response = await TutorService.getTutorById(tutorId as string);
      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Update Tutor Profile
   */
  // public static updateTutor = asyncHandler(
  //   async (req: Request, res: Response) => {
  //     const tutorId = req.params.id;

  //     if (!tutorId) {
  //       throw ApiError.badRequest("TutorId is required");
  //     }

  //     const response = await TutorService.updateTutor(
  //       tutorId as string,
  //       req.body,
  //     );
  //     return res.status(response.statusCode).json(response);
  //   },
  // );

  /**
   * Delete Tutor
   */
  public static deleteTutor = asyncHandler(
    async (req: Request, res: Response) => {
      const tutorId = req.params.id;

      if (!tutorId) {
        throw ApiError.badRequest("TutorId is required");
      }

      const response = await TutorService.deleteTutor(tutorId as string);
      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Create Availability Rule
   */
  public static createAvailability = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req?.user?.id;

      if (!userId) {
        throw ApiError.forbidden("Only tutors can manage availability");
      }

      const rawData = req.body;

      const validatedAvailabilityData = AvailabilityRuleSchema.parse(rawData);

      const response = await TutorService.createAvailability(
        userId,
        validatedAvailabilityData,
      );

      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Update Availability Rule
   */
  public static updateAvailabilityRule = asyncHandler(
    async (req: Request, res: Response) => {
      const tutorId = req?.user?.id;
      const ruleId = req.params.id;

      if (!tutorId) {
        throw ApiError.forbidden("Only tutors can manage availability");
      }

      if (!ruleId) {
        throw ApiError.badRequest("Rule ID is required");
      }

      // Parse and validate input
      const rawData = req.body;

      const validatedData = UpdateAvailabilitySchema.parse(rawData);

      const response = await TutorService.updateAvailabilityRule(
        tutorId,
        ruleId as string,
        validatedData,
      );

      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Get Availability By ID
   */
  public static getAvailabilityById = asyncHandler(
    async (req: Request, res: Response) => {
      const availabilityId = req.params.id;

      if (!availabilityId) {
        throw ApiError.badRequest("Availability ID is required");
      }

      const response = await TutorService.getAvailabilityById(
        availabilityId as string,
      );

      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Get Tutor Availability
   */
  public static getTutorAvailability = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req?.user?.id;
      if (!userId) {
        throw ApiError.forbidden("Only tutors can access availability");
      }

      const response = await TutorService.getTutorAvailability(userId);

      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Get Availabilities
   */
  public static getAvailabilitySlots = asyncHandler(
    async (req: Request, res: Response) => {
      const tutorId = req.params.id;

      if (!tutorId) {
        throw ApiError.badRequest("Tutor ID is required");
      }

      const response = await TutorService.getAvailabilitySlots(
        tutorId as string,
      );

      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Delete Availability Rule
   */
  public static deleteAvailabilityRule = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req?.user?.id;
      const ruleId = req.params.id;

      if (!userId || !ruleId) {
        throw ApiError.badRequest("TutorId or RuleId missing");
      }

      const response = await TutorService.deleteAvailabilityRule(
        userId,
        ruleId as string,
      );

      return res.status(response.statusCode).json(response);
    },
  );

  /**
   * Enable / Disable Availability Rule
   */
  public static toggleAvailabilityRule = asyncHandler(
    async (req: Request, res: Response) => {
      const tutorId = req?.user?.id;
      const ruleId = req.params.id;
      const { isActive } = req.body;

      if (!tutorId || !ruleId) {
        throw ApiError.badRequest("TutorId or RuleId missing");
      }

      const response = await TutorService.toggleAvailabilityRule(
        tutorId,
        ruleId as string,
        Boolean(isActive),
      );

      return res.status(response.statusCode).json(response);
    },
  );
}
