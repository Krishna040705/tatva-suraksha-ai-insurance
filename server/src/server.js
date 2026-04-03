import { initialiseRepositories } from "./config/db.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { runAutomationForAllActivePolicies } from "./services/claim-automation.service.js";
import { ensureDemoAccount } from "./services/demo.service.js";

const { repositories, mode } = await initialiseRepositories();

await ensureDemoAccount(repositories);

const app = createApp(repositories, mode);

if (env.enableBackgroundJobs) {
  setInterval(() => {
    runAutomationForAllActivePolicies(repositories).catch((error) => {
      console.error("[suraksha] background automation failed", error);
    });
  }, 120000);
}

app.listen(env.port, () => {
  console.log(
    `[suraksha] API running on http://localhost:${env.port} using ${mode} persistence`,
  );
});
