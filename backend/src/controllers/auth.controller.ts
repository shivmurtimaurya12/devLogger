import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import type { AuthRequest } from "../middlewares/auth.middleware";

/**
 * Register a new user with username/email and password.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, displayName, email, username, password } = req.body;

    const rawUsername = (username || "").trim().toLowerCase();
    const rawEmail = (email || (rawUsername ? `${rawUsername}@sidenote.app` : "")).trim().toLowerCase();
    const effectiveName = (displayName || name || rawUsername || "Reader").trim();

    if (!rawUsername && !rawEmail) {
      res.status(400).json({ error: "Username or email is required" });
      return;
    }

    // Check for existing user by email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: rawEmail },
          ...(rawUsername ? [{ username: rawUsername }] : []),
        ],
      },
    });

    if (existingUser) {
      if (rawUsername && existingUser.username === rawUsername) {
        res.status(400).json({ error: "That username is already taken" });
        return;
      }
      res.status(400).json({ error: "An account with that email already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: rawEmail,
        username: rawUsername || null,
        name: effectiveName,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);

    // Set secure auth cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        displayName: user.name || user.username || "Reader",
      },
      token,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error during registration" });
  }
};

/**
 * Log in an existing user with email/username and password.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, identifier, password } = req.body;
    const loginIdentifier = (identifier || username || email || "").trim().toLowerCase();

    if (!loginIdentifier || !password) {
      res.status(400).json({ error: "Username/email and password are required" });
      return;
    }

    // Find by either email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier },
          { username: loginIdentifier },
        ],
      },
    });

    if (!user) {
      res.status(401).json({ error: "No account found with those credentials" });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Incorrect password" });
      return;
    }

    const token = generateToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        displayName: user.name || user.username || "Reader",
      },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
};

/**
 * Log out user by clearing the auth cookie.
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * Get profile of current logged-in user.
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.status(200).json({
    user: {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      name: req.user.name,
      displayName: req.user.name || req.user.username || "Reader",
    },
  });
};
