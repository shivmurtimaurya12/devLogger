import type { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validate = (schema: ZodObject) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { success } = schema.safeParse(req.body);
    if (!success) {
      res.status(401).json({ error: "invalid credentials !" });
      return;
    }

    next();
  };
};
