export interface StockSymbolDataProvider {
    requestApi<T>(endpointPath: string, rawQueryParams: Record<string, string>): Promise<T>;
}
