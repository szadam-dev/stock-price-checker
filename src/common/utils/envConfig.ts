import dotenv from "dotenv";
import { bool, cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production" : ".env.development",
});

export const ENVIRONMENT_VARS = cleanEnv(process.env, {
    ENABLE_STOCK_SYMBOL_PRICE_CHECK_JOB: bool({ default: true }),
    CRON_POLL_INTERVAL: str(),
    API_ROOT_PATH: str(),
    STOCK_SYMBOL_PROVIDER_API_BASE_URL: str(),
    STOCK_SYMBOL_PROVIDER_API_KEY: str(),
    NODE_ENV: str({ devDefault: testOnly("test"), choices: ["development", "production", "test"] }),
    HOST: host({ devDefault: "localhost" }),
    PORT: port({ devDefault: 3000 }),
    CORS_ORIGIN: str({ devDefault: "http://localhost:3000" }),
    COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: 1 }),
    COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: 1000 }),
    SERVER_SHUTDOWN_TIMEOUT_MS: num(),
});
