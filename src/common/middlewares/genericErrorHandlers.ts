import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constants/httpStatusCode";

export const unexpectedRequestHandler = (_req: Request, res: Response) => {
    res.sendStatus(HttpStatus.NOT_FOUND);
};

export const errorRequestLogHandler: ErrorRequestHandler = (
    err: Error,
    _req: Request,
    res: Response,
    next: NextFunction,
) => {
    res.locals.err = err;
    next(err);
};
