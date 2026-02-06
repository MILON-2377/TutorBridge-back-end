import { Request, Response } from "express";
import asyncHandler from "../../utils/AsyncHandler.js";
import { ProfileSchema, RoleSchema } from "./user.validation.js";
import UserService from "./user.service.js";
import ApiError from "../../utils/ApiError.js";
import auth from "../../lib/auth.js";
import { object, User } from "better-auth";
import ApiResponse from "../../utils/ApiResponse.js";

export default class UserController {
  public static getSession = asyncHandler(
    async (req: Request, res: Response) => {
      const session = await auth.api.getSession({
        headers: Object.fromEntries(
          Object.entries(req.headers).map(([key, value]) => [
            key,
            String(value),
          ]),
        ),
      });

      if (!session?.session) {
        return res
          .status(200)
          .json(ApiResponse.success("No session found", session?.session));
      }

      const response = await UserService.getUser(session.session.userId);

      return res.status(response.statusCode).json(response);
    },
  );

  public static setRole = asyncHandler(async (req: Request, res: Response) => {
    const user = req?.user;

    const rawData = req.body;

    if (!user) {
      throw ApiError.unauthorized(
        "You must have to sign-up before select role",
      );
    }

    const userId = user?.id;

    const validatedRole = RoleSchema.parse(rawData);

    const response = await UserService.setRole(userId, validatedRole.role);

    return res.status(response.statusCode).json(response);
  });

  public static updateProfile = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req?.user?.id;

      if (!userId) {
        throw ApiError.unauthorized("Unauthorized: invalid credentials");
      }

      const rawData = req.body;


      const cleanedData = {
        ...rawData,
        image: rawData.image?.trim() === "" ? undefined : rawData.image,
      };
      const validatedProfile = ProfileSchema.parse(cleanedData);


      const response = await UserService.updateProfile(
        userId,
        validatedProfile,
      );

      return res.status(response.statusCode).json(response);
    },
  );
}
