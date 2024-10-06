import type { StockSymbolDataProvider } from "@api/stockSymbol/service/stockSymbolDataProvider";
import { ServiceError } from "@common/error/serviceError";
import { ENVIRONMENT_VARS } from "@common/utils/envConfig";
import { FinnhubApiConstant } from "./finnhubApiConstants";

export class FinnhubStockSymbolDataProviderImpl implements StockSymbolDataProvider {
    async requestApi<T>(endpointPath: string, rawQueryParams: Record<string, string>): Promise<T> {
        const parsedQueryParams = new URLSearchParams(rawQueryParams);
        const endpointUrl = this.generateEndpointUrl(endpointPath, parsedQueryParams.toString());
        const rawResponse = await fetch(endpointUrl, { headers: this.getAuthTokenHeader() });

        if (!rawResponse.ok) {
            throw new ServiceError("Error occurred during API request");
        }

        return <T>rawResponse.json();
    }

    private getAuthTokenHeader(): Record<string, string> {
        const apiKey = ENVIRONMENT_VARS.STOCK_SYMBOL_PROVIDER_API_KEY;

        return { [FinnhubApiConstant.AUTH_TOKEN_HEADER_KEY]: apiKey };
    }

    private generateEndpointUrl(endpointPath: string, queryParams: string): string {
        const apiBaseUrl = ENVIRONMENT_VARS.STOCK_SYMBOL_PROVIDER_API_BASE_URL;

        return `${apiBaseUrl}${endpointPath}?${queryParams}`;
    }
}
