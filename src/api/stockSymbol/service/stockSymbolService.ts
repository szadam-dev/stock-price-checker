import type { StockSymbolInfo } from "../stockSymbolTypes";

export interface StockSymbolService {
    getStockSymbolInfo(stockSymbol: string): Promise<StockSymbolInfo | null>;
    registerPriceCheckJob(stockSymbol: string): Promise<void>;
}
