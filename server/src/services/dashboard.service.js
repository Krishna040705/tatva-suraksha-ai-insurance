import { disruptionScenarios } from "../data/scenarios.js";
import { sanitizeUser } from "./auth.service.js";
import { buildPremiumQuote, buildSignalSnapshot } from "./risk.service.js";

export async function buildDashboardOverview(repositories, user) {
  const policies = await repositories.policies.listByUserId(user._id);
  const claims = await repositories.claims.listByUserId(user._id);
  const triggers = await repositories.triggers.listByUserId(user._id, 8);
  const activePolicy = policies.find((policy) => policy.status === "active");
  const liveSnapshot = buildSignalSnapshot(user, "balanced-day");
  const quotePreview = buildPremiumQuote(user, {
    coverageAmount: activePolicy?.coverageAmount,
    coverageHours: activePolicy?.coverageHours,
  });

  return {
    user: sanitizeUser(user),
    policies,
    claims,
    triggers,
    quotePreview,
    liveSnapshot,
    scenarios: disruptionScenarios,
    metrics: {
      activePolicies: policies.filter((policy) => policy.status === "active").length,
      automatedClaims: claims.length,
      totalPayouts: claims
        .filter((claim) => claim.status === "paid")
        .reduce((sum, claim) => sum + claim.payoutAmount, 0),
      protectionStatus: activePolicy ? "Protected" : "Needs Policy",
    },
  };
}
