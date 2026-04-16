import { fraudPresets } from "../data/fraud-presets.js";
import { disruptionScenarios } from "../data/scenarios.js";
import {
  buildBusinessMetrics,
  buildPortfolioForecast,
  buildWorkerForecast,
} from "./analytics.service.js";
import { sanitizeUser } from "./auth.service.js";
import { listGatewayOptions } from "./payout.service.js";
import { buildPremiumQuote, buildSignalSnapshot } from "./risk.service.js";

function round(value) {
  return Math.round(value || 0);
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildWorkerOverview(user, policies, claims, triggers) {
  const activePolicy = policies.find((policy) => policy.status === "active");
  const liveSnapshot = buildSignalSnapshot(user, "balanced-day");
  const quotePreview = buildPremiumQuote(user, {
    coverageAmount: activePolicy?.coverageAmount,
    coverageHours: activePolicy?.coverageHours,
  });
  const forecast = buildWorkerForecast(user, activePolicy, liveSnapshot);
  const paidClaims = claims.filter((claim) => claim.status === "paid");
  const flaggedClaims = claims.filter((claim) => claim.status === "flagged");
  const payoutDurations = paidClaims
    .map((claim) => claim.payout?.settlementMinutes)
    .filter(Boolean);

  return {
    view: "worker",
    user: sanitizeUser(user),
    policies,
    claims,
    triggers,
    quotePreview,
    liveSnapshot,
    scenarios: disruptionScenarios,
    fraudPresets,
    gatewayOptions: listGatewayOptions(),
    metrics: {
      activePolicies: policies.filter((policy) => policy.status === "active").length,
      automatedClaims: claims.length,
      totalPayouts: paidClaims.reduce((sum, claim) => sum + claim.payoutAmount, 0),
      weeklyPremium: activePolicy?.dynamicPremium || 0,
      earningsProtected: forecast.expectedProtectedIncome,
      protectionStatus: activePolicy ? "Protected" : "Needs Policy",
    },
    workerIntelligence: {
      activePolicy,
      forecast,
      payoutSummary: {
        settledClaims: paidClaims.length,
        flaggedClaims: flaggedClaims.length,
        avgSettlementMinutes: round(average(payoutDurations)),
        latestPayout: paidClaims[0]?.payout || null,
      },
      fraudCenter: {
        trustScore: user.trustScore,
        safeAutomationRate: claims.length
          ? Number((paidClaims.length / claims.length).toFixed(2))
          : 1,
        latestAssessment: claims[0]?.fraudAssessment || null,
      },
    },
  };
}

function buildAdminOverview(user, users, policies, claims, triggers) {
  const activePolicies = policies.filter((policy) => policy.status === "active");
  const businessMetrics = buildBusinessMetrics(users, policies, claims);
  const forecast = buildPortfolioForecast(
    users.filter((entry) => entry.role !== "admin"),
    activePolicies,
  );
  const recentClaims = claims.slice(0, 8);
  const recentTriggers = triggers.slice(0, 8);
  const premiumAdequacy = businessMetrics.weeklyPremiumPool
    ? Number(
        (
          (businessMetrics.weeklyPremiumPool - businessMetrics.settledPayouts) /
          businessMetrics.weeklyPremiumPool
        ).toFixed(2),
      )
    : 0;
  const predictiveLossRatio = businessMetrics.weeklyPremiumPool
    ? Number(
        (
          forecast.expectedPayouts /
          Math.max(1, businessMetrics.weeklyPremiumPool)
        ).toFixed(2),
      )
    : 0;

  return {
    view: "admin",
    user: sanitizeUser(user),
    scenarios: disruptionScenarios,
    fraudPresets,
    gatewayOptions: listGatewayOptions(),
    adminConsole: {
      kpis: {
        workersCovered: activePolicies.length,
        activePolicies: activePolicies.length,
        weeklyPremiumPool: businessMetrics.weeklyPremiumPool,
        settledPayouts: businessMetrics.settledPayouts,
        liveLossRatio: businessMetrics.lossRatio,
        predictiveLossRatio,
        flaggedClaims: businessMetrics.flaggedClaims,
        nextWeekExpectedClaims: forecast.expectedClaims,
      },
      likelyTriggers: forecast.likelyTriggers,
      cityRiskTable: forecast.cityRiskTable,
      recentClaims,
      recentTriggers,
      portfolioRows: users
        .filter((entry) => entry.role !== "admin")
        .map((worker) => {
          const workerPolicy = activePolicies.find((policy) => policy.userId === worker._id);
          const workerClaims = claims.filter((claim) => claim.userId === worker._id);
          const settledPayouts = workerClaims
            .filter((claim) => claim.status === "paid")
            .reduce((sum, claim) => sum + claim.payoutAmount, 0);

          return {
            workerId: worker._id,
            fullName: worker.fullName,
            city: worker.city,
            platform: worker.platform,
            riskBand: workerPolicy?.riskBand || "uninsured",
            premium: workerPolicy?.dynamicPremium || 0,
            payouts: settledPayouts,
            trustScore: worker.trustScore,
          };
        })
        .sort((left, right) => right.payouts - left.payouts),
      businessMetrics: {
        ...businessMetrics,
        premiumAdequacy,
        breakEvenWorkers: Math.max(
          25,
          round((forecast.expectedPayouts + 18000) / Math.max(1, 62)),
        ),
      },
      viabilityModel: {
        targetMargin: "18% contribution margin at steady state",
        pricingNarrative:
          "Weekly pricing stays viable when low-risk and moderate-risk workers are pooled with transparent trigger thresholds and instant digital payouts.",
        expansionNarrative:
          "Pilot first in dense delivery corridors where payout certainty improves retention and insurer loss ratios remain visible week by week.",
      },
    },
  };
}

export async function buildDashboardOverview(repositories, user) {
  if (user.role === "admin") {
    const [users, policies, claims, triggers] = await Promise.all([
      repositories.users.list(),
      repositories.policies.list(),
      repositories.claims.list(),
      repositories.triggers.listRecent(20),
    ]);

    return buildAdminOverview(user, users, policies, claims, triggers);
  }

  const [policies, claims, triggers] = await Promise.all([
    repositories.policies.listByUserId(user._id),
    repositories.claims.listByUserId(user._id),
    repositories.triggers.listByUserId(user._id, 8),
  ]);

  return buildWorkerOverview(user, policies, claims, triggers);
}
