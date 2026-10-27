import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Middleware factory that validates request body against a Zod schema.
 * Returns detailed, user-friendly error messages if validation fails.
 */
export const validate = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      res.status(400).json({
        error: "Validation error",
        details: formattedErrors,
        message: formattedErrors[0]?.message || "Invalid input data",
      });
      return;
    }
    req.body = result.data;
    next();
  };
};
