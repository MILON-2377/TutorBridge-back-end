import { Request, Response, NextFunction } from "express";
import auth from "../lib/auth.js";
import prisma from "../lib/prisma.js";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: UserRole;
  };
}

const authentication = (...allowedRoles: UserRole[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1️⃣ Validate session
      const session = await auth.api.getSession({
        headers: req.headers as Record<string, string>,
      });

      if (!session?.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // 2️⃣ Fetch role from DB
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // 3️⃣ Attach user
      req.user = user;

      // 4️⃣ Role guard
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: "Forbidden: insufficient permissions",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authentication;
