import { HEALTH_CHECK_PATH } from "@api/healthCheck/healthCheckRouter";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
    createRateLimitingErrorResponseDescription,
    createSuccessResponseDescription,
} from "@open-api/openAPIResponseBuilders";
import { z } from "zod";

const HEALTH_CHECK_KEY = "Health Check";
const healthCheckRegistry = new OpenAPIRegistry();

healthCheckRegistry.registerPath({
    method: "get",
    path: HEALTH_CHECK_PATH,
    tags: [HEALTH_CHECK_KEY],
    responses: {
        ...createSuccessResponseDescription(z.null(), "Service is healthy."),
        ...createRateLimitingErrorResponseDescription(),
    },
});

export { healthCheckRegistry };
