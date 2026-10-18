import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// The browser calls same-origin /api/potion; in dev Vite proxies /api to the
// Node service (default port 8787, per the plan's Q6), so there is no CORS and
// no backend base URL baked into the bundle.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
