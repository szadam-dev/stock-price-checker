import { FinnhubApiConstant } from "@api/thirdPartyIntegration/finnhub/finnhubApiConstants";
import { HttpStatus } from "@common/constants/httpStatusCode";
import { ServiceError } from "@common/error/serviceError";
import { ENVIRONMENT_VARS } from "@common/utils/envConfig";
import { logger } from "@server";
import { CronJob } from "cron";
import type {
    GetStockSymbolMetadataResult,
    GetStockSymbolQuoteResult,
    StockSymbolInfo,
    StockSymbolPriceJobConfiguration,
    StockSymbolRegistryEntry,
} from "../stockSymbolTypes";
import type { StockSymbolDataProvider } from "./stockSymbolDataProvider";
import type { StockSymbolService } from "./stockSymbolService";

export class StockSymbolServiceImpl implements StockSymbolService {
    private static isInitialized: boolean;
    private stockSymbolJobRegistry: Map<string, StockSymbolRegistryEntry> = new Map();
    private knownStockSymbolRegistry: Map<string, boolean> = new Map();
    private readonly jobConfiguration!: StockSymbolPriceJobConfiguration;

    constructor(private dataProviderInstance: StockSymbolDataProvider) {
        if (StockSymbolServiceImpl.isInitialized) {
            return;
        }
        this.jobConfiguration = {
            isEnabled: ENVIRONMENT_VARS.ENABLE_STOCK_SYMBOL_PRICE_CHECK_JOB,
            cronPollInterval: ENVIRONMENT_VARS.CRON_POLL_INTERVAL,
        };

        /*
         * Just to protect against repeated initialization, "singletonify".
         * Normally a DI container would take care for obtaining the same instance, wiring and so on.
         */
        StockSymbolServiceImpl.isInitialized = true;
    }

    async getStockSymbolInfo(stockSymbol: string): Promise<StockSymbolInfo | null> {
        try {
            const { c: currentPrice } = await this.dataProviderInstance.requestApi<GetStockSymbolQuoteResult>(
                FinnhubApiConstant.STOCK_SYMBOL_PRICE_CHECK_PATH,
                {
                    [FinnhubApiConstant.SYMBOL_QUERY_PARAM]: stockSymbol,
                },
            );

            return {
                price: currentPrice,
                lastUpdatedAt: new Date(),
                movingAverage: this.calculateMovingAverage(stockSymbol),
            };
        } catch (error) {
            const errorMessage = "Unable to fetch stock symbol price";
            const errorInstance = <Error>error;

            logger.error(`${errorMessage}: %s.`, errorInstance?.message ?? errorInstance?.cause);

            throw new ServiceError(errorMessage);
        }
    }

    async registerPriceCheckJob(stockSymbol: string): Promise<void> {
        try {
            this.validatePriceCheckJobPreconditions(stockSymbol);

            await this.recognizeStockSymbol(stockSymbol);

            this.schedulePriceCheckJob(stockSymbol);
        } catch (error) {
            logger.error("Error occurred during job scheduling: %s", (error as ServiceError)?.message);

            throw error;
        }
    }

    private schedulePriceCheckJob(stockSymbol: string) {
        const { cronPollInterval } = this.jobConfiguration;
        const initialEntry: StockSymbolRegistryEntry = { prices: [] };

        this.stockSymbolJobRegistry.set(stockSymbol, initialEntry);

        logger.info(`Scheduling stock symbol "${stockSymbol}" price check job.`);

        const onTick = async (): Promise<void> => {
            if (!this.stockSymbolJobRegistry.has(stockSymbol)) {
                throw new Error(`Unable to locate symbol: "${stockSymbol}" in the registry.`);
            }

            const entry = this.stockSymbolJobRegistry.get(stockSymbol)!;

            const stockSymbolInfo = await this.getStockSymbolInfo(stockSymbol);

            if (stockSymbolInfo === null) {
                return;
            }

            if (entry.prices.length === 10) {
                entry.prices.shift();
            }

            entry.prices.push(stockSymbolInfo.price);
        };

        const task: CronJob = CronJob.from({ cronTime: cronPollInterval, onTick, start: true });

        if (!this.stockSymbolJobRegistry.has(stockSymbol)) {
            throw new ServiceError(`Unable to locate stock symbol: "${stockSymbol}" in the registry.`);
        }

        this.stockSymbolJobRegistry.get(stockSymbol)!.task = task;
        logger.info(`Successfully registered price check job for stock symbol: "${stockSymbol}".`);
    }

    private calculateMovingAverage(stockSymbol: string): number {
        if (!this.stockSymbolJobRegistry.has(stockSymbol)) {
            logger.warn(`No price check job has been scheduled for stock symbol: "${stockSymbol}".`);
            return 0;
        }

        const { prices }: StockSymbolRegistryEntry = this.stockSymbolJobRegistry.get(stockSymbol)!;

        if (prices.length === 0) {
            return 0;
        }

        return prices.reduce((prevPrice, currPrice) => prevPrice + currPrice, 0) / prices.length;
    }

    private async isKnownStockSymbol(stockSymbol: string): Promise<boolean> {
        try {
            const { count, result } = await this.dataProviderInstance.requestApi<GetStockSymbolMetadataResult>(
                FinnhubApiConstant.STOCK_SYMBOL_METADATA_PATH,
                {
                    [FinnhubApiConstant.METADATA_SEARCH_QUERY_PARAM]: stockSymbol,
                    [FinnhubApiConstant.STOCK_SYMBOL_METADATA_SEARCH_EXCHANGE_CODE]:
                        FinnhubApiConstant.STOCK_SYMBOL_METADATA_SEARCH_EXCHANGE_CODE_DEFAULT,
                },
            );

            if (count === 0) {
                return false;
            }

            return result.some(({ symbol }) => symbol === stockSymbol);
        } catch (error) {
            const errorInstance = <Error>error;
            logger.error("Unable to fetch stock symbol metadata: %s.", errorInstance?.message ?? errorInstance?.cause);

            return false;
        }
    }

    private async recognizeStockSymbol(stockSymbol: string): Promise<void> {
        if (this.knownStockSymbolRegistry.get(stockSymbol)) {
            return;
        }

        const isKnownSymbol = await this.isKnownStockSymbol(stockSymbol);

        if (!isKnownSymbol) {
            throw new ServiceError(`Could not recognize stock symbol: "${stockSymbol}".`, HttpStatus.BAD_REQUEST);
        }

        this.knownStockSymbolRegistry.set(stockSymbol, true);
    }

    private validatePriceCheckJobPreconditions(stockSymbol: string): void {
        if (!this.jobConfiguration.isEnabled) {
            throw new ServiceError("Price checking feature is not enabled.");
        }

        if (this.stockSymbolJobRegistry.has(stockSymbol)) {
            throw new ServiceError(
                `Stock symbol: "${stockSymbol}" has already a scheduled job registered.`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
