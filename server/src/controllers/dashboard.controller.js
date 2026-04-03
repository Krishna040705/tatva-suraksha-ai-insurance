import { sanitizeUser } from "../services/auth.service.js";
import { buildDashboardOverview } from "../services/dashboard.service.js";

export async function getOverview(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const overview = await buildDashboardOverview(repositories, sanitizeUser(req.user));
    return res.json(overview);
  } catch (error) {
    return next(error);
  }
}
