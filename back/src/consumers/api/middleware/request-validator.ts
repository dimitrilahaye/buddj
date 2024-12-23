import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import RequestValidationError from "../errors/DeserializationError.js";

interface ValidationSchema {
  body?: ZodSchema<any>;
  params?: ZodSchema<any>;
  query?: ZodSchema<any>;
}

export const requestValidator = (schemas: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const key of Object.keys(schemas)) {
      const schema = schemas[key as keyof ValidationSchema];
      if (schema) {
        const result = schema.safeParse(req[key as keyof Request]);

        if (!result.success) {
          const firstError = result.error.errors[0];
          throw new RequestValidationError(null, firstError.message);
        }
      }
    }

    next();
  };
};
