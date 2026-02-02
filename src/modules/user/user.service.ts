import { UserRole } from "@prisma/client";
import prisma from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export default class UserService {
  public static getUser = async (userId: string) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      return ApiResponse.success("User fetched successfully", user);
    } catch (error) {
      throw new ApiError(500, `Get Users error: ${error}`);
    }
  };

  public static setRole = async (userId: string, role: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || role.toUpperCase() !== UserRole.TUTOR) {
      throw ApiError.unauthorized("You are not allowed to set or update role");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: UserRole.TUTOR,
        onboardingStatus: "IN_PROGRESS",
      },
    });

    return ApiResponse.success("Selected role updated", updatedUser);
  };

}
