import { ENVIRONMENT_VARS } from "@common/utils/envConfig";
import { app, logger } from "./server";

process.on("uncaughtException", error => {
    logger.error(`Uncaught exception occurred: ${error.message ?? error.cause ?? ""}.`);
    process.exit(1);
});

process.on("unhandledRejection", reason => {
    logger.error(`Unhandled rejection occurred: ${reason}.`);
    process.exit(1);
});

const server = app.listen(ENVIRONMENT_VARS.PORT, () => {
    const { NODE_ENV, HOST, PORT } = ENVIRONMENT_VARS;
    logger.info(`Server is up - [URL: "%s", ENV: "%s"].`, `http://${HOST}:${PORT}`, NODE_ENV);
});

const onCloseSignal = () => {
    logger.info("Interrupt received, shutting down.");
    server.close(() => {
        logger.info("Server has been shut down.");
        process.exit();
    });
    setTimeout(() => process.exit(1), ENVIRONMENT_VARS.COMMON_RATE_LIMIT_WINDOW_MS).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
