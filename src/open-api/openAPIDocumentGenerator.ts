import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";

import { healthCheckRegistry } from "@api/healthCheck/docs/healthCheckApiDocs";
import { stockSymbolRegistry } from "@api/stockSymbol/docs/stockSymbolApiDocs";

export function generateOpenAPIDocument() {
    const registry = new OpenAPIRegistry([healthCheckRegistry, stockSymbolRegistry]);
    const generator = new OpenApiGeneratorV31(registry.definitions);

    return generator.generateDocument({
        openapi: "3.0.0",
        info: {
            version: "0.0.1",
            title: "Stock Price Checker API",
            description: "Application for checking stock symbol prices.",
        },
        externalDocs: {
            description: "View the raw OpenAPI Specification in JSON format",
            url: "/swagger.json",
        },
    });
}
