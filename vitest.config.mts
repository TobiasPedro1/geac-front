import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    alias: {
      "@": resolve(__dirname, "./"),
    },
    exclude: ["node_modules", ".next", "out", "tests"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // include: ['src/**/*.ts'],
      // exclude: ['src/types.ts'],
    },
  },
});
