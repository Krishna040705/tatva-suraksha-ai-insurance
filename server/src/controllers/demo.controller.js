import { buildDashboardOverview } from "../services/dashboard.service.js";
import { issueToken, sanitizeUser } from "../services/auth.service.js";
import { ensureDemoAccount } from "../services/demo.service.js";

export async function bootstrapDemo(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const account = await ensureDemoAccount(repositories);
    const persona = req.body?.persona === "admin" ? "admin" : "worker";
    const credentials =
      persona === "admin" ? account.adminCredentials : account.credentials;
    const user = await repositories.users.findByEmail(credentials.email);
    const overview = await buildDashboardOverview(repositories, user);

    return res.json({
      ...account,
      token: issueToken(user),
      user: sanitizeUser(user),
      activePersona: persona,
      credentials,
      overview,
    });
  } catch (error) {
    return next(error);
  }
}
