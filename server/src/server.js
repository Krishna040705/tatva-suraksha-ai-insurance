import { initialiseRepositories } from "./config/db.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { runAutomationForAllActivePolicies } from "./services/claim-automation.service.js";
import { ensureDemoAccount } from "./services/demo.service.js";
import express from "express";
import path from "path";

const { repositories, mode } = await initialiseRepositories();

await ensureDemoAccount(repositories);

const app = createApp(repositories, mode);

// Serve frontend
app.use(express.static(path.join(process.cwd(), "client/dist")));

// For React routing
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "client/dist/index.html"));
});

if (env.enableBackgroundJobs) {
  setInterval(() => {
    runAutomationForAllActivePolicies(repositories).catch((error) => {
      console.error("[suraksha] background automation failed", error);
    });
  }, 120000);
}

// PORT (IMPORTANT)
const PORT = process.env.PORT || env.port;
app.listen(PORT, () => {
  console.log(
    `[suraksha] API running on http://localhost:${PORT} using ${mode} persistence`,
  );
});
