import { healthCheckRouter } from "@api/healthCheck/healthCheckRouter";
import type { StockSymbolService } from "@api/stockSymbol/service/stockSymbolService";
import { StockSymbolServiceImpl } from "@api/stockSymbol/service/stockSymbolServiceImpl";
import { getStockSymbolApiRouter } from "@api/stockSymbol/stockSymbolRouter";
import { FinnhubStockSymbolDataProviderImpl } from "@api/thirdPartyIntegration/finnhub/finnhubStockSymbolDataProviderImpl";
import { errorRequestLogHandler, unexpectedRequestHandler } from "@common/middlewares/genericErrorHandlers";
import { rateLimiterMiddleware } from "@common/middlewares/rateLimiter";
import { requestLoggerMiddleware } from "@common/middlewares/requestLogger";
import { ENVIRONMENT_VARS } from "@common/utils/envConfig";
import { openAPIRouter } from "@open-api/openAPIRouter";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

const wireDependencies = (): { stockSymbolService: StockSymbolService } => {
    const stockSymbolDataProviderInstance = new FinnhubStockSymbolDataProviderImpl();

    return {
        stockSymbolService: new StockSymbolServiceImpl(stockSymbolDataProviderInstance),
    };
};

export const bootstrapApplication = (app: Express): void => {
    const { stockSymbolService } = wireDependencies();

    app.set("trust proxy", true);

    // Application level middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({ origin: ENVIRONMENT_VARS.CORS_ORIGIN, credentials: true }));
    app.use(helmet());
    app.use(rateLimiterMiddleware());
    app.use(requestLoggerMiddleware());

    // Business functionality
    app.use(getStockSymbolApiRouter(stockSymbolService));

    app.use(healthCheckRouter());
    app.use(openAPIRouter);
    app.use(unexpectedRequestHandler);
    app.use(errorRequestLogHandler);
};
