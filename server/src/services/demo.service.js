import { buildPremiumQuote } from "./risk.service.js";
import { hashPassword, issueToken, sanitizeUser } from "./auth.service.js";

const demoUserPayload = {
  fullName: "Aarav Singh",
  email: "rider@suraksha.demo",
  role: "worker",
  phone: "9876543210",
  city: "Mumbai",
  zoneType: "high-risk",
  occupation: "Delivery Rider",
  platform: "Swiggy",
  weeklyIncome: 9000,
  upiId: "aarav@upi",
  preferredPayoutRail: "razorpay",
  trustScore: 86,
  telemetryProfile: {
    gpsLocation: "matched",
    networkLocation: "matched",
    gpsDriftKm: 0.8,
    routeDeviationScore: 7,
    movement: "active",
    staticMinutes: 9,
    routeSpeedKph: 31,
    deviceIntegrityConfidence: 0.94,
    claimFrequency: 0,
    inSuspiciousCluster: false,
    weatherReportConfidence: 0.91,
    reportedRainMm: null,
    riderDeclaredConditions: "aligned",
  },
};

const demoAdminPayload = {
  fullName: "Meera Nair",
  email: "ops@suraksha.demo",
  role: "admin",
  phone: "9123456780",
  city: "Bengaluru",
  zoneType: "moderate",
  occupation: "Insurer Operations Lead",
  platform: "Suraksha Console",
  weeklyIncome: 0,
  upiId: "ops@upi",
  preferredPayoutRail: "upi",
  trustScore: 93,
  telemetryProfile: {
    gpsLocation: "matched",
    networkLocation: "matched",
    gpsDriftKm: 0.5,
    routeDeviationScore: 2,
    movement: "active",
    staticMinutes: 4,
    routeSpeedKph: 18,
    deviceIntegrityConfidence: 0.98,
    claimFrequency: 0,
    inSuspiciousCluster: false,
    weatherReportConfidence: 0.98,
    reportedRainMm: null,
    riderDeclaredConditions: "aligned",
  },
};

async function ensureUser(repositories, payload, password) {
  let user = await repositories.users.findByEmail(payload.email);

  if (!user) {
    user = await repositories.users.create({
      ...payload,
      passwordHash: await hashPassword(password),
    });
  } else {
    user = await repositories.users.updateById(user._id, {
      ...payload,
    });
  }

  return user;
}

export async function ensureDemoAccount(repositories) {
  const worker = await ensureUser(repositories, demoUserPayload, "demo1234");
  await ensureUser(repositories, demoAdminPayload, "admin1234");

  const policies = await repositories.policies.listByUserId(worker._id);
  const activePolicy = policies.find((policy) => policy.status === "active");

  if (!activePolicy) {
    const quote = buildPremiumQuote(worker, {
      coverageAmount: 6500,
      coverageHours: 56,
    });

    await repositories.policies.create({
      userId: worker._id,
      ...quote,
      status: "active",
      payoutGatewayId: demoUserPayload.preferredPayoutRail,
      triggerConfig: {
        heavyRain: 70,
        flooding: 72,
        extremeHeat: 42,
        airPollution: 280,
        curfew: 70,
      },
    });
  } else if (!activePolicy.payoutGatewayId) {
    await repositories.policies.updateById(activePolicy._id, {
      payoutGatewayId: demoUserPayload.preferredPayoutRail,
    });
  }

  return {
    token: issueToken(worker),
    user: sanitizeUser(worker),
    credentials: {
      email: demoUserPayload.email,
      password: "demo1234",
    },
    adminCredentials: {
      email: demoAdminPayload.email,
      password: "admin1234",
    },
  };
}
