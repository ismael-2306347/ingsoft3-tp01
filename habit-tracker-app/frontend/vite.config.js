import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
    test: {
    exclude: [...configDefaults.exclude, "e2e/**"],   // vitest NO toca los specs de Playwright (viven en e2e/)
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      include: ["src/lib/**", "src/api/**"],
      exclude: ["**/*.test.js"],
      thresholds: { lines: 90, branches: 90 },
    },
  },
});
