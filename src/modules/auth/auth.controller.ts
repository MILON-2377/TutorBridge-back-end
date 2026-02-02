import { Request, Response } from "express";
import asyncHandler from "../../utils/AsyncHandler.js";
import AuthService from "./auth.service.js";

export default class AuthController {
  public static signOut = asyncHandler(async (req: Request, res: Response) => {
    const response = await AuthService.signOut(req);

    return res.status(response.statusCode).json(response);
  });
}
