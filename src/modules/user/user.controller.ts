import { Request, Response } from "express";
import asyncHandler from "../../utils/AsyncHandler.js";
import { RoleSchema } from "./user.validation.js";
import UserService from "./user.service.js";
import ApiError from "../../utils/ApiError.js";

export default class UserController {
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
}
