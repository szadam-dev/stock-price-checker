import { HttpStatus } from "@common/constants/httpStatusCode";
import type { ServiceError } from "@common/error/serviceError";
import { ENVIRONMENT_VARS } from "@common/utils/envConfig";
import { validateRequest } from "@common/utils/httpHandlers";
import { type NextFunction, type Request, type Response, Router } from "express";
import { stockSymbolPathParamSchema } from "./docs/stockSymbolSchemas";
import type { StockSymbolService } from "./service/stockSymbolService";

export const STOCK_SYMBOL_API_BASE_PATH = `${ENVIRONMENT_VARS.API_ROOT_PATH}/stock`;
export const STOCK_SYMBOL_API_PATH_PARAM = ":symbol";
export const STOCK_SYMBOL_API_ROUTE = `${STOCK_SYMBOL_API_BASE_PATH}/${STOCK_SYMBOL_API_PATH_PARAM}`;

type EnhancedAsyncExpressRequestHandler = (
    req: Request,
    res: Response,
    serviceInstance: StockSymbolService,
) => Promise<void>;

const withStockSymbolService = (serviceInstance: StockSymbolService, handler: EnhancedAsyncExpressRequestHandler) => {
    return (req: Request, res: Response) => handler(req, res, serviceInstance);
};

const getStockSymbolInfoRouteHandler = async (
    req: Request,
    res: Response,
    serviceInstance: StockSymbolService,
): Promise<void> => {
    const parsedSymbol = req.params?.symbol;
    const stockSymbolInfo = await serviceInstance.getStockSymbolInfo(parsedSymbol);

    if (stockSymbolInfo === null) {
        res.status(HttpStatus.NOT_FOUND).send("Unable to find price information for symbol.");
        return;
    }

    res.status(HttpStatus.SUCCESS).json(stockSymbolInfo);
};

const getStockSymbolPriceCheckJobRouteHandler = async (
    req: Request,
    res: Response,
    serviceInstance: StockSymbolService,
): Promise<void> => {
    const parsedSymbol = req.params?.symbol;

    await serviceInstance.registerPriceCheckJob(parsedSymbol);

    res.status(HttpStatus.SUCCESS).send(`Price check job for stock symbol: "${parsedSymbol}" has been scheduled.`);
};

// next must be kept here, otherwise Express won't recognize, that it is an error handler middleware.
const errorHandlerMiddleware = (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
    const serviceError = <ServiceError>error;

    res.status(serviceError.code).send(serviceError.message);

    return;
};

export const getStockSymbolApiRouter = (serviceInstance: StockSymbolService): Router => {
    const stockSymbolApiRouter: Router = Router();

    stockSymbolApiRouter.get(
        STOCK_SYMBOL_API_ROUTE,
        validateRequest(stockSymbolPathParamSchema),
        withStockSymbolService(serviceInstance, getStockSymbolInfoRouteHandler),
    );
    stockSymbolApiRouter.put(
        STOCK_SYMBOL_API_ROUTE,
        validateRequest(stockSymbolPathParamSchema),
        withStockSymbolService(serviceInstance, getStockSymbolPriceCheckJobRouteHandler),
    );
    stockSymbolApiRouter.use(errorHandlerMiddleware);

    return stockSymbolApiRouter;
};
