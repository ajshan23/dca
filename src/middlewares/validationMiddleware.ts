import { Request, Response, NextFunction } from "express";
import { AnySchema, ValidationError } from "yup";
import { AppError } from "../utils/errorHandler";

export function validateRequest(schema: AnySchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (err) {
      // Type guard to check if it's a Yup ValidationError
      if (err instanceof ValidationError) {
        return next(new AppError(err.message, 400));
      }

      // Handle other types of errors
      const errorMessage =
        err instanceof Error ? err.message : "Validation failed";
      return next(new AppError(errorMessage, 400));
    }
  };
}
