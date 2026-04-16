import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import claimRoutes from "./routes/claim.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import demoRoutes from "./routes/demo.routes.js";
import policyRoutes from "./routes/policy.routes.js";
import triggerRoutes from "./routes/trigger.routes.js";
import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

export function createApp(repositories, mode) {
  const app = express();

  app.locals.repositories = repositories;
  app.locals.mode = mode;

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      persistenceMode: app.locals.mode,
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/claims", claimRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/demo", demoRoutes);
  app.use("/api/policies", policyRoutes);
  app.use("/api/triggers", triggerRoutes);

  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get(/^(?!\/api).*/, (req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
