import { Tutor, UserRole, WeekDay } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { AvailabilityRuleInput, CreateTutorInput, TutorInput } from "./tutor.validation.js";
import ApiResponse from "../../utils/ApiResponse.js";
import paginate, { PaginationParams } from "../helpers/pagination.js";

export default class TutorService {
  // Create Tutor
  public static createTutor = async (data: CreateTutorInput, userId: string) => {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw ApiError.forbidden("You must be signed in first");
      }

      const existingTutor = await tx.tutor.findUnique({
        where: { userId },
      });

      if (existingTutor) {
        throw ApiError.badRequest("Tutor profile already exists");
      }

      const { category, tutorDetails, role } = data;

      const tutor = await tx.tutor.create({
        data: {
          ...tutorDetails,
          userId,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          role: UserRole.TUTOR,
          onboardingStatus: "IN_PROGRESS",
        },
      });

      if (category) {
        await tx.tutorCategory.createMany({
          data: {
            tutorId: tutor.id,
            categoryId: category.id
          }
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          onboardingStatus: "COMPLETED",
        },
      });

      return ApiResponse.success("Tutor created successfully", tutor);
    });
  };

  public static getTutors = async (params: PaginationParams) => {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const filter: any = {};
    if (search) {
      filter.OR = [
        { bio: { contains: search, mode: "insensitive" } },
        { languages: { has: search } },
      ];
    }

    const result = await paginate(
      prisma.tutor,
      { page, limit, sortBy, sortOrder },
      { where: filter },
    );

    return ApiResponse.success("Tutors fetched successfully", result);
  };

  public static getTutorById = async (tutorId: string) => {
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
      include: { tutorCategories: true, user: true, availabilityRules: true },
    });

    if (!tutor) throw ApiError.notFound("Tutor not found");

    return ApiResponse.success("Tutor fetched successfully", tutor);
  };

  // public static updateTutor = async (
  //   tutorId: string,
  //   data: Partial<TutorInput>,
  // ) => {
  //   const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } });
  //   if (!tutor) throw ApiError.notFound("Tutor not found");

  //   const updatedTutor = await prisma.tutor.update({
  //     where: { id: tutorId },
  //     data,
  //   });

  //   if (data.categoryIds) {
  //     await prisma.tutorCategory.deleteMany({ where: { tutorId } });

  //     await prisma.tutorCategory.createMany({
  //       data: data.categoryIds.map((categoryId) => ({ tutorId, categoryId })),
  //     });
  //   }

  //   return ApiResponse.success("Tutor updated successfully", updatedTutor);
  // };

  // Delete tutor
  public static deleteTutor = async (tutorId: string) => {
    const tutor = await prisma.tutor.findUnique({ where: { id: tutorId } });
    if (!tutor) throw ApiError.notFound("Tutor not found");

    await prisma.tutorCategory.deleteMany({ where: { tutorId } });
    await prisma.availabilityRule.deleteMany({ where: { tutorId } });
    await prisma.tutor.delete({ where: { id: tutorId } });

    return ApiResponse.success("Tutor deleted successfully", null);
  };

  // Get Availabilities
  public static getTutorAvailability = async (userId: string) => {
    const tutor = await prisma.tutor.findUnique({
      where: {
        userId,
      },
    });

    if (!tutor) {
      throw ApiError.notFound("Tutor not found");
    }

    const availability = await prisma.availabilityRule.findMany({
      where: { tutorId: tutor.id },
      include: {
        availabilitySlots: {
          where: { status: "AVAILABLE" },
          orderBy: { date: "asc" },
        },
      },
    });

    return ApiResponse.success(
      "Tutor availability fetched successfully",
      availability,
    );
  };

  // Create Availability
  public static createAvailability = async (
    userId: string,
    data: AvailabilityRuleInput,
  ) => {
    const tutor = await prisma.tutor.findUnique({
      where: { userId },
    });

    const tutorId = tutor?.id;

    if (!tutor || !tutorId) {
      throw ApiError.notFound("Tutor not found");
    }

    const rule = await prisma.availabilityRule.create({
      data: {
        tutorId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    return ApiResponse.created(rule, "Availability rule created successfully");
  };

  // Generate Availability Slot
  public static generateAvailabilitySlots = async (
    userId: string,
    ruleId: string,
    daysAhead = 14,
  ) => {
    const tutor = await prisma.tutor.findUnique({
      where: {
        userId,
      },
    });

    const tutorId = tutor?.id;

    if (!tutor || !tutorId) {
      throw ApiError.notFound("tutor id not found");
    }

    const rule = await prisma.availabilityRule.findFirst({
      where: {
        id: ruleId,
        tutorId,
        isActive: true,
      },
    });

    if (!rule) {
      throw ApiError.notFound("Availability rule not found");
    }

    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayName = date
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase() as WeekDay;

      if (dayName !== rule.dayOfWeek) continue;

      slots.push({
        availabilityRuleId: rule.id,
        date,
        startTime: rule.startTime,
        endTime: rule.endTime,
      });
    }

    if (!slots.length) {
      throw ApiError.badRequest("No slots generated");
    }

    await prisma.availabilitySlot.createMany({
      data: slots,
      skipDuplicates: true,
    });

    return ApiResponse.success(
      "Availability slots generated successfully",
      slots.length,
    );
  };

  // Toggle Availability
  public static toggleAvailabilityRule = async (
    userId: string,
    ruleId: string,
    isActive: boolean,
  ) => {
    const tutor = await prisma.tutor.findUnique({
      where: {
        userId,
      },
    });

    if (!tutor) {
      throw ApiError.notFound("Tutor not found");
    }

    const rule = await prisma.availabilityRule.findFirst({
      where: { id: ruleId, tutorId: tutor.id },
    });

    if (!rule) {
      throw ApiError.notFound("Availability rule not found");
    }

    const updatedRule = await prisma.availabilityRule.update({
      where: { id: ruleId },
      data: { isActive },
    });

    return ApiResponse.success("Availability rule updated", updatedRule);
  };

  // Delete Availability
  public static deleteAvailabilityRule = async (
    tutorId: string,
    ruleId: string,
  ) => {
    const rule = await prisma.availabilityRule.findFirst({
      where: { id: ruleId, tutorId },
    });

    if (!rule) {
      throw ApiError.notFound("Availability rule not found");
    }

    await prisma.availabilityRule.delete({
      where: { id: ruleId },
    });

    return ApiResponse.success("Availability rule deleted successfully", null);
  };
}
