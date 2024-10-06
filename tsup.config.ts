import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src", "!src/**/__tests__/**", "!src/**/*.test.*"],
    splitting: false,
    sourcemap: process.env.NODE_ENV !== "production",
    clean: true,
    format: "esm",
    minify: process.env.NODE_ENV === "production",
});
