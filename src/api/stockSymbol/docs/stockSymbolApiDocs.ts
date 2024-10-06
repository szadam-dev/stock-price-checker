import { StockSymbolInfoSchema, stockSymbolPathParamSchema } from "@api/stockSymbol/docs/stockSymbolSchemas";
import { STOCK_SYMBOL_API_BASE_PATH } from "@api/stockSymbol/stockSymbolRouter";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { HttpStatus } from "@common/constants/httpStatusCode";
import { SwaggerHttpMethod } from "@common/constants/swaggerHttpMethod";
import {
    createErrorResponseDescription,
    createRateLimitingErrorResponseDescription,
    createSuccessResponseDescription,
} from "@open-api/openAPIResponseBuilders";

const stockSymbolRegistry = new OpenAPIRegistry();

const STOCK_SYMBOL_KEY = "stockSymbol";

stockSymbolRegistry.register(STOCK_SYMBOL_KEY.toString(), stockSymbolPathParamSchema);

const getStockSymbolInfoApiDescription = {
    method: SwaggerHttpMethod.GET,
    path: `${STOCK_SYMBOL_API_BASE_PATH}/{symbol}`,
    tags: [STOCK_SYMBOL_KEY],
    request: { params: stockSymbolPathParamSchema.shape.params },
    responses: {
        ...createRateLimitingErrorResponseDescription(),
        ...createSuccessResponseDescription(StockSymbolInfoSchema, "Returns the stock symbol information.", {
            price: 210.1,
            lastUpdatedAt: new Date(),
            movingAverage: 210.1,
        }),
        ...createErrorResponseDescription("Invalid / unknown stock symbol has been provided.", HttpStatus.BAD_REQUEST),
    },
};

const createStockSymbolPriceCheckJobApiDescription = {
    description: "Sets up a background job for obtaining the prices of a stock symbol.",
    method: SwaggerHttpMethod.PUT,
    path: `${STOCK_SYMBOL_API_BASE_PATH}/{symbol}`,
    tags: [STOCK_SYMBOL_KEY],
    request: { params: stockSymbolPathParamSchema.shape.params },
    responses: {
        [HttpStatus.SUCCESS]: {
            description: "The job has been successfully scheduled.",
        },
        ...createRateLimitingErrorResponseDescription(),
        ...createErrorResponseDescription("Invalid / unknown stock symbol has been provided.", HttpStatus.BAD_REQUEST),
        ...createErrorResponseDescription("The job is not enabled.", HttpStatus.INTERNAL_SERVER_ERROR),
    },
};

stockSymbolRegistry.registerPath(getStockSymbolInfoApiDescription);
stockSymbolRegistry.registerPath(createStockSymbolPriceCheckJobApiDescription);

export { stockSymbolRegistry };
