import {
  hashPassword,
  issueToken,
  sanitizeUser,
  verifyPassword,
} from "../services/auth.service.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateRegistrationPayload(body) {
  const requiredFields = [
    "fullName",
    "email",
    "phone",
    "password",
    "city",
    "zoneType",
    "occupation",
    "platform",
    "weeklyIncome",
    "upiId",
  ];

  const missing = requiredFields.filter((field) => !body[field]);

  if (missing.length) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  return null;
}

export async function register(req, res, next) {
  try {
    const validationMessage = validateRegistrationPayload(req.body);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const repositories = req.app.locals.repositories;
    const normalizedEmail = normalizeEmail(req.body.email);
    const existingUser = await repositories.users.findByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await repositories.users.create({
      fullName: req.body.fullName,
      email: normalizedEmail,
      phone: req.body.phone,
      passwordHash: await hashPassword(req.body.password),
      city: req.body.city,
      zoneType: req.body.zoneType,
      occupation: req.body.occupation,
      platform: req.body.platform,
      weeklyIncome: Number(req.body.weeklyIncome),
      upiId: req.body.upiId,
      trustScore: 82,
      telemetryProfile: {
        gpsLocation: "matched",
        networkLocation: "matched",
        movement: "active",
        claimFrequency: 0,
        inSuspiciousCluster: false,
      },
    });

    return res.status(201).json({
      token: issueToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const repositories = req.app.locals.repositories;
    const user = await repositories.users.findByEmail(normalizeEmail(req.body.email));

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await verifyPassword(
      req.body.password || "",
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({
      token: issueToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}
