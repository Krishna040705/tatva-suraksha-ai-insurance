import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const repositories = req.app.locals.repositories;
    const user = await repositories.users.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User session is no longer valid." });
    }

    req.auth = {
      token,
      userId: payload.sub,
    };
    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
