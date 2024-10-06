import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const StockSymbolInfoSchema = z.object({
    price: z.number(),
    lastUpdatedAt: z.date(),
    movingAverage: z.number(),
});

export const stockSymbolPathParamSchema = z.object({
    params: z.object({ symbol: z.string().trim().min(1) }),
});
