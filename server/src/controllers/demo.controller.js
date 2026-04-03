import { buildDashboardOverview } from "../services/dashboard.service.js";
import { sanitizeUser } from "../services/auth.service.js";
import { ensureDemoAccount } from "../services/demo.service.js";

export async function bootstrapDemo(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const account = await ensureDemoAccount(repositories);
    const user = await repositories.users.findByEmail(account.credentials.email);
    const overview = await buildDashboardOverview(repositories, user);

    return res.json({
      ...account,
      user: sanitizeUser(user),
      overview,
    });
  } catch (error) {
    return next(error);
  }
}
