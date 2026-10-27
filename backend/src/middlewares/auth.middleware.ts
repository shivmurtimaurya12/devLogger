import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
  };
}

/**
 * Middleware that verifies JWT token from Authorization header or cookie.
 * Attaches the authenticated user to req.user.
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined;

    const token = req.cookies?.token || headerToken;

    if (!token) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, username: true },
    });

    if (!user) {
      res.status(401).json({ error: "Unauthorized: User account not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
};
