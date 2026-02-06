import {
  Prisma,
  PrismaClient,
  SlotStatus,
  UserRole,
  WeekDay,
} from "@prisma/client";
import prisma from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import {
  AvailabilityRuleInput,
  CreateTutorInput,
  UpdateAvailabilityInput,
} from "./tutor.validation.js";
import ApiResponse from "../../utils/ApiResponse.js";
import paginate, { PaginationParams } from "../helpers/pagination.js";

export default class TutorService {
  // Create Tutor
  public static createTutor = async (
    data: CreateTutorInput,
    userId: string,
  ) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.forbidden("You must be signed in first");

    const existingTutor = await prisma.tutor.findUnique({ where: { userId } });
    if (existingTutor)
      throw ApiError.badRequest("Tutor profile already exists");

    const { category, tutorDetails } = data;

    const tutor = await prisma.tutor.create({
      data: {
        ...tutorDetails,
        userId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { role: UserRole.TUTOR, onboardingStatus: "COMPLETED" },
    });

    if (category) {
      const categoryData = Array.isArray(category)
        ? category.map((cat) => ({ tutorId: tutor.id, categoryId: cat.id }))
        : [{ tutorId: tutor.id, categoryId: category.id }];

      await prisma.tutorCategory.createMany({
        data: categoryData,
        skipDuplicates: true,
      });
    }

    return ApiResponse.success("Tutor created successfully", tutor);
  };

  // Get Tutors
  public static getTutors = async (params: PaginationParams) => {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      subject = "",
    } = params;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const filter: any = {};
    if (search) {
      filter.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { bio: { contains: search, mode: "insensitive" } },
        { languages: { has: search } },
        {
          tutorCategories: {
            some: {
              category: { name: { contains: search, mode: "insensitive" } },
            },
          },
        },
      ];
    }

    if (subject) {
      filter.tutorCategories = {
        some: { category: { name: { equals: subject, mode: "insensitive" } } },
      };
    }

    const result = await paginate(
      prisma.tutor,
      {
        page: pageNumber,
        limit: limitNumber,
        sortBy,
        sortOrder,
        include: {
          user: true,
          tutorCategories: {
            include: {
              category: true,
            },
          },
        },
      },
      { where: filter },
    );

    return ApiResponse.success("Tutors fetched successfully", result);
  };

  // Get Tutor ByID
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

    if (!tutor) {
      throw ApiError.notFound("Tutor not found");
    }

    const overlappingRule = await prisma.availabilityRule.findFirst({
      where: {
        tutorId: tutor.id,
        dayOfWeek: data.dayOfWeek,
        isActive: true,
        AND: [
          { startMinute: { lt: data.endMinute } },
          { endMinute: { gt: data.startMinute } },
        ],
      },
    });

    if (overlappingRule) {
      throw ApiError.badRequest("Availability overlaps with an existing rule");
    }

    const rule = await prisma.availabilityRule.create({
      data: {
        tutorId: tutor.id,
        dayOfWeek: data.dayOfWeek,
        startMinute: data.startMinute,
        endMinute: data.endMinute,
      },
    });

    await this.generateAvailabilitySlots(rule.id, prisma);

    return ApiResponse.created(rule, "Availability rule created successfully");
  };

  // Generate Availability Slot
  static WEEKDAY_MAP: Record<number, WeekDay> = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
  };

  public static generateAvailabilitySlots = async (
    ruleId: string,
    prismaClient: PrismaClient | Prisma.TransactionClient,
  ) => {
    const rule = await prismaClient.availabilityRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) throw ApiError.notFound("Rule not found");

    const slots: Prisma.AvailabilitySlotCreateManyInput[] = [];

    const today = new Date();
    const dayOffset =
      [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ].indexOf(rule.dayOfWeek) - today.getDay();

    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + dayOffset);

    for (let minute = rule.startMinute; minute < rule.endMinute; minute += 30) {
      slots.push({
        availabilityRuleId: rule.id,
        startMinute: minute,
        endMinute: Math.min(minute + 30, rule.endMinute),
        date: slotDate,
      });
    }

    await prismaClient.availabilitySlot.createMany({
      data: slots,
      skipDuplicates: true,
    });
  };

  // Update Availability
  public static updateAvailabilityRule = async (
    userId: string,
    ruleId: string,
    data: Partial<UpdateAvailabilityInput>,
  ) => {
    const tutor = await prisma.tutor.findUnique({
      where: { userId },
    });

    if (!tutor) {
      throw ApiError.notFound("Tutor not found");
    }

    const rule = await prisma.availabilityRule.findFirst({
      where: {
        id: ruleId,
        tutorId: tutor.id,
      },
    });

    if (!rule) {
      throw ApiError.notFound("Availability rule not found");
    }

    const updatedDay = data.dayOfWeek ?? rule.dayOfWeek;
    const updatedStart = data.startMinute ?? rule.startMinute;
    const updatedEnd = data.endMinute ?? rule.endMinute;

    if (updatedStart >= updatedEnd) {
      throw ApiError.badRequest("Invalid time range");
    }

    const overlappingRule = await prisma.availabilityRule.findFirst({
      where: {
        tutorId: tutor.id,
        dayOfWeek: updatedDay,
        isActive: true,
        NOT: { id: rule.id },
        AND: [
          { startMinute: { lt: updatedEnd } },
          { endMinute: { gt: updatedStart } },
        ],
      },
    });

    if (overlappingRule) {
      throw ApiError.badRequest(
        "Updated availability overlaps with an existing rule",
      );
    }

    const updatedRule = await prisma.availabilityRule.update({
      where: { id: ruleId },
      data: {
        ...(data.dayOfWeek !== undefined && {
          dayOfWeek: data.dayOfWeek,
        }),
        ...(data.startMinute !== undefined && {
          startMinute: data.startMinute,
        }),
        ...(data.endMinute !== undefined && {
          endMinute: data.endMinute,
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
    });

    await prisma.availabilitySlot.deleteMany({
      where: {
        availabilityRuleId: rule.id,
        date: {
          gte: new Date(),
        },
        status: SlotStatus.AVAILABLE,
      },
    });

    if (updatedRule.isActive) {
      await this.generateAvailabilitySlots(updatedRule.id, prisma);
    }

    return ApiResponse.success(
      "Availability rule updated successfully",
      updatedRule,
    );
  };

  // Get Availability By ID
  public static getAvailabilityById = async (id: string) => {
    try {
      const availability = await prisma.availabilityRule.findFirst({
        where: {
          id,
        },
      });

      if (!availability) {
        throw ApiError.notFound("Availability not found");
      }

      return ApiResponse.success(
        "Fetched availability successfully",
        availability,
      );
    } catch (error) {
      throw ApiError.error("Get availability error ");
    }
  };

  // Get Availability Rules  0
  public static getAvailabilitySlots = async (tutorId: string) => {
    try {
      if (!tutorId) {
        throw ApiError.notFound("Tutor not found");
      }

      const availabilitySlots = await prisma.availabilitySlot.findMany({
        where: {
          availabilityRule: {
            tutorId,
            isActive: true,
          },
          status: SlotStatus.AVAILABLE,
        },
        orderBy: [{ date: "asc" }, { startMinute: "asc" }],
      });

      return ApiResponse.success(
        "Availability rules fetched successfully",
        availabilitySlots,
      );
    } catch (error) {
      console.error("Get availability rules error ", error);
      throw ApiError.error("Failed to fetch availability rules");
    }
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
    userId: string,
    ruleId: string,
  ) => {
    const tutor = await prisma.tutor.findUnique({
      where: {
        userId,
      },
    });

    const tutorId = tutor?.id;

    if (!tutorId) {
      throw ApiError.notFound("Tutor not found");
    }

    const rule = await prisma.availabilityRule
      .findFirst({
        where: { id: ruleId, tutorId },
      })
      .catch((err) => {
        console.error("Db query failed", err);
        throw ApiError.error("Database unavailable");
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
