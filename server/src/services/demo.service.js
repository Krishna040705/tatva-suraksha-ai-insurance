import { buildPremiumQuote } from "./risk.service.js";
import { hashPassword, issueToken, sanitizeUser } from "./auth.service.js";

const demoUserPayload = {
  fullName: "Aarav Singh",
  email: "rider@suraksha.demo",
  phone: "9876543210",
  city: "Mumbai",
  zoneType: "high-risk",
  occupation: "Delivery Rider",
  platform: "Swiggy",
  weeklyIncome: 9000,
  upiId: "aarav@upi",
  trustScore: 86,
  telemetryProfile: {
    gpsLocation: "matched",
    networkLocation: "matched",
    movement: "active",
    claimFrequency: 0,
    inSuspiciousCluster: false,
  },
};

export async function ensureDemoAccount(repositories) {
  let user = await repositories.users.findByEmail(demoUserPayload.email);

  if (!user) {
    user = await repositories.users.create({
      ...demoUserPayload,
      passwordHash: await hashPassword("demo1234"),
    });
  }

  const policies = await repositories.policies.listByUserId(user._id);
  const activePolicy = policies.find((policy) => policy.status === "active");

  if (!activePolicy) {
    const quote = buildPremiumQuote(user, {
      coverageAmount: 6500,
      coverageHours: 56,
    });

    await repositories.policies.create({
      userId: user._id,
      ...quote,
      status: "active",
      triggerConfig: {
        heavyRain: 70,
        flooding: 72,
        extremeHeat: 42,
        airPollution: 280,
        curfew: 70,
      },
    });
  }

  return {
    token: issueToken(user),
    user: sanitizeUser(user),
    credentials: {
      email: demoUserPayload.email,
      password: "demo1234",
    },
  };
}
