import { Request } from "express";
import auth from "../../lib/auth.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export default class AuthService {
  /**
   * Sign out
   */
  public static signOut = async (req: Request) => {
    try {
      await auth.api.signOut({
        headers: Object.fromEntries(
          Object.entries(req.headers).map(([key, value]) => [
            key,
            String(value),
          ]),
        ),
      });

      return ApiResponse.success("User logged out successfully", null);
    } catch (error) {
      throw new ApiError(500, "User sign out errors");
    }
  };
}
