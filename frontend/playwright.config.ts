import { defineConfig, devices } from "@playwright/test";

// 5173 is occupied by another user's copy of this app on this shared machine,
// so e2e runs on its own dedicated frontend (port 5199, --strictPort) and
// never adopts a foreign server (reuseExistingServer: false). The run starts
// both the backend (port 8787, proxied via /api) and this frontend itself.
const FRONTEND_PORT = 5199;
const BACKEND_PORT = 8787;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run dev",
      cwd: "../backend",
      url: `http://localhost:${BACKEND_PORT}`,
      reuseExistingServer: false,
      env: { PORT: String(BACKEND_PORT) },
    },
    {
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      url: `http://localhost:${FRONTEND_PORT}`,
      reuseExistingServer: false,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
