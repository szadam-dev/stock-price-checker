import type { IncomingMessage, ServerResponse } from "node:http";
import type { Request, RequestHandler, Response } from "express";
import type { LevelWithSilent } from "pino";
import { type CustomAttributeKeys, type Options, pinoHttp } from "pino-http";

import { HttpStatus } from "../constants/httpStatusCode";
import { LogLevel } from "../constants/logLevel";
import { ENVIRONMENT_VARS } from "../utils/envConfig";

type PinoCustomProps = {
    request: Request;
    response: Response;
    error: Error;
    responseBody: unknown;
};

export const requestLoggerMiddleware = (options: Options = {}): RequestHandler[] => {
    const pinoOptions: Options = {
        enabled: ENVIRONMENT_VARS.isProduction,
        customProps: customProps as unknown as Options["customProps"],
        redact: [],
        formatters: {
            level: label => ({ level: label }),
        },
        genReqId,
        customLogLevel,
        customReceivedMessage: req => `Request received: ${req.method}`,
        customErrorMessage: (_req, res) => `Request errored with status code: ${res.statusCode}`,
        customAttributeKeys,
        ...options,
    };
    return [responseBodyMiddleware, pinoHttp(pinoOptions)];
};

const customAttributeKeys: CustomAttributeKeys = {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "timeTaken",
};

const customProps = (req: Request, res: Response): PinoCustomProps => ({
    request: req,
    response: res,
    error: res.locals.err,
    responseBody: res.locals.responseBody,
});

const responseBodyMiddleware: RequestHandler = (_req, res, next) => {
    const isNotProduction = !ENVIRONMENT_VARS.isProduction;
    if (isNotProduction) {
        const originalSend = res.send;
        res.send = content => {
            res.locals.responseBody = content;
            res.send = originalSend;
            return originalSend.call(res, content);
        };
    }
    next();
};

const customLogLevel = (_req: IncomingMessage, res: ServerResponse<IncomingMessage>, err?: Error): LevelWithSilent => {
    if (err || res.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) return LogLevel.ERROR;
    if (res.statusCode >= HttpStatus.BAD_REQUEST) return LogLevel.WARN;
    return LogLevel.INFO;
};

const genReqId = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    const existingID = req.id ?? req.headers["x-request-id"];
    if (existingID) return existingID;
    // Instead of randomUUID (to make it more lightweight).
    const id = Math.random().toString(16);
    res.setHeader("X-Request-Id", id);
    return id;
};
