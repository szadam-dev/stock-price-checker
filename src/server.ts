import express, { type Express } from "express";
import { pino } from "pino";
import { bootstrapApplication } from "./bootstrapApplication";

export const APPLICATION_NAME = "Stock Price Checker";

const logger = pino({ name: APPLICATION_NAME });
const app: Express = express();

try {
    bootstrapApplication(app);
} catch (error) {
    logger.error("Unable to initialize application: %s.", (error as Error)?.message);
    process.exit(1);
}

export { app, logger };
