import type { RouteConfig } from "@asteasolutions/zod-to-openapi/dist/openapi-registry";
import { HttpStatus } from "@common/constants/httpStatusCode";
import { MimeType } from "@common/constants/mimeType";
import type { z } from "zod";

export const createSuccessResponseDescription = <T>(
    schema: z.ZodTypeAny,
    description: string,
    example?: T,
    statusCode = HttpStatus.SUCCESS,
): RouteConfig["responses"] => ({
    [statusCode]: {
        description,
        content: {
            [MimeType.JSON]: { schema, example },
        },
    },
});

export const createRateLimitingErrorResponseDescription = (): RouteConfig["responses"] => ({
    [HttpStatus.TOO_MANY_REQUESTS]: { description: "Too many requests have been sent." },
});

export const createErrorResponseDescription = (
    description: string,
    statusCode: HttpStatus,
): RouteConfig["responses"] => ({
    [statusCode]: { description },
});
