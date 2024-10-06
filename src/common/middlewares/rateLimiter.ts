import type { Request } from "express";
import { rateLimit } from "express-rate-limit";

import { ENVIRONMENT_VARS } from "../utils/envConfig";

export const rateLimiterMiddleware = () => {
    return rateLimit({
        legacyHeaders: true,
        limit: ENVIRONMENT_VARS.COMMON_RATE_LIMIT_MAX_REQUESTS,
        message: "Too many requests, please try again later.",
        standardHeaders: true,
        windowMs: 15 * 60 * ENVIRONMENT_VARS.COMMON_RATE_LIMIT_WINDOW_MS,
        keyGenerator: (req: Request) => req.ip as string,
    });
};
