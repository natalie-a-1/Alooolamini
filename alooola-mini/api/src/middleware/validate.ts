/**
 * Request Validation Middleware
 *
 * Validates the incoming request using a provided Zod schema.
 * - Validates req.body, req.params, and req.query as a single object.
 * - On success: updates req.body, req.params, req.query with parsed values and calls next().
 * - On failure: forwards a bad request (400) error with validation issues to the error handler.
 *
 * @param schema - Zod schema for validation (should expect an object with body, params, query)
 * @returns Express middleware that performs request validation
 *
 * @example
 *   import { z } from "zod";
 *   const schema = z.object({
 *     body: z.object({ ... }),
 *     params: z.object({ ... }),
 *     query: z.object({ ... }),
 *   });
 *   app.post("/some-route", validate(schema), handler);
 */

import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { badRequest } from "../lib/errors";

/**
 * Express middleware to validate request body, params, and query via Zod schema.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validation = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!validation.success) {
      return next(
        badRequest("Validation error", "VALIDATION_ERROR", {
          issues: validation.error.flatten(),
        })
      );
    }

    // Overwrite req.body, req.params, req.query with parsed/validated data
    req.body = validation.data.body;
    req.params = validation.data.params;
    req.query = validation.data.query;

    next();
  };
}
