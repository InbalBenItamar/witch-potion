import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { potionRouter } from "./route/potion.js";

/**
 * The Node service. It owns all potion logic and the API key boundary — the
 * browser holds neither. In dev the browser reaches it same-origin through
 * Vite's `/api` proxy; CORS is configured only for non-proxied use and allows
 * `FRONTEND_URL` alone.
 */
export function createApp() {
  const app = express();
  app.use(express.json());

  const origin = process.env.FRONTEND_URL;
  app.use(cors(origin ? { origin } : { origin: false }));

  // A trivial root for readiness checks (e.g. Playwright's webServer wait).
  app.get("/", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", potionRouter);

  return app;
}

// Listen only when run directly, not when imported by a test.
const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const app = createApp();
  const port = Number(process.env.PORT) || 8787;
  app.listen(port, () => {
    console.log({ event: "listening", port });
  });
}
