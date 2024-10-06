import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodSchema } from "zod";

import { HttpStatus } from "../constants/httpStatusCode";

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse({ body: req.body, query: req.query, params: req.params });
            next();
        } catch (err) {
            const errorMessage = `Invalid input: ${(err as ZodError).errors.map(e => e.message).join(", ")}`;
            res.status(HttpStatus.BAD_REQUEST).send(errorMessage);
        }
    };
};
