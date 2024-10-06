import type { CronJob } from "cron";
import type { z } from "zod";
import type { StockSymbolInfoSchema } from "./docs/stockSymbolSchemas";

enum StockSymbolType {
    COMMON_STOCK = "Common Stock",
}

export type GetStockSymbolQuoteResult = {
    c: number;
    d: number;
    dp: number;
    h: number;
    l: number;
    o: number;
    pc: number;
};

export type StockSymbolInfo = z.infer<typeof StockSymbolInfoSchema>;

export type StockSymbolMetadata = {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: StockSymbolType;
};

export type GetStockSymbolMetadataResult = {
    count: number;
    result: StockSymbolMetadata[];
};

export type StockSymbolPriceJobConfiguration = {
    isEnabled: boolean;
    cronPollInterval: string;
};

export type StockSymbolRegistryEntry = { task?: CronJob; prices: number[] };
