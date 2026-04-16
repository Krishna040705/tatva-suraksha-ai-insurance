import { randomUUID } from "crypto";
import {
  getScenarioById,
  triggerLossHours,
  triggerThresholds,
} from "../data/scenarios.js";
import { evaluateFraud } from "./fraud.service.js";
import { buildSignalSnapshot } from "./risk.service.js";
import { buildPayoutSimulation } from "./payout.service.js";

function roundMoney(value) {
  return Math.max(0, Math.round(value));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function severityLabel(metric, threshold) {
  if (metric >= threshold * 1.3) {
    return "critical";
  }

  if (metric >= threshold * 1.12) {
    return "high";
  }

  return "medium";
}

function buildTriggerCandidates(snapshot) {
  const candidates = [];

  if (snapshot.rainfallMm >= triggerThresholds.heavy_rain) {
    candidates.push({
      triggerType: "heavy_rain",
      metric: snapshot.rainfallMm,
      threshold: triggerThresholds.heavy_rain,
      source: "mock-weather-feed",
      narrative:
        "Heavy rain exceeded the insured threshold and reduced safe working hours.",
    });
  }

  if (snapshot.waterloggingIndex >= triggerThresholds.flooding) {
    candidates.push({
      triggerType: "flooding",
      metric: snapshot.waterloggingIndex,
      threshold: triggerThresholds.flooding,
      source: "mock-flood-feed",
      narrative:
        "Waterlogging alerts confirmed road disruption across the worker zone.",
    });
  }

  if (snapshot.heatIndex >= triggerThresholds.extreme_heat) {
    candidates.push({
      triggerType: "extreme_heat",
      metric: snapshot.heatIndex,
      threshold: triggerThresholds.extreme_heat,
      source: "mock-heat-feed",
      narrative:
        "Heat index remained above safe riding limits during core earning hours.",
    });
  }

  if (snapshot.aqi >= triggerThresholds.air_pollution) {
    candidates.push({
      triggerType: "air_pollution",
      metric: snapshot.aqi,
      threshold: triggerThresholds.air_pollution,
      source: "mock-aqi-feed",
      narrative:
        "Air quality degraded beyond the covered threshold for extended periods.",
    });
  }

  if (snapshot.curfewLevel >= triggerThresholds.curfew) {
    candidates.push({
      triggerType: "curfew",
      metric: snapshot.curfewLevel,
      threshold: triggerThresholds.curfew,
      source: "mock-civic-feed",
      narrative:
        "Local curfew restrictions sharply cut operating windows and demand.",
    });
  }

  return candidates;
}

function claimPayout(user, policy, triggerType, severity) {
  const baseHours = triggerLossHours[triggerType] || 6;
  const hoursMultiplier =
    severity === "critical" ? 1.35 : severity === "high" ? 1.15 : 1;
  const safeCoverageHours = clamp(
    Math.round(Number(policy.coverageHours) || 0),
    0,
    168,
  );
  const safeCoverageAmount = Math.max(0, Math.round(Number(policy.coverageAmount) || 0));
  const lossHours = Math.min(
    safeCoverageHours,
    Math.round(baseHours * hoursMultiplier),
  );
  const hourlyIncome = user.weeklyIncome / 54;
  const payoutAmount = Math.min(
    safeCoverageAmount,
    roundMoney(hourlyIncome * lossHours),
  );

  return {
    lossHours,
    payoutAmount,
  };
}

export async function runAutomationForUser(
  repositories,
  user,
  policies,
  scenarioId = "balanced-day",
  simulationOptions = {},
) {
  const scenario = getScenarioById(scenarioId);
  const activePolicies = policies.filter((policy) => policy.status === "active");
  const triggerEvents = [];
  const createdClaims = [];

  for (const policy of activePolicies) {
    const snapshot = buildSignalSnapshot(user, scenario.id);
    const candidates = buildTriggerCandidates(snapshot);

    if (!candidates.length) {
      continue;
    }

    for (const candidate of candidates) {
      const severity = severityLabel(candidate.metric, candidate.threshold);
      const eventKey = [
        policy._id,
        scenario.id,
        candidate.triggerType,
        simulationOptions.fraudPresetId || "clean",
        new Date().toISOString().slice(0, 10),
      ].join(":");

      const existingClaim = await repositories.claims.findByEventKey({
        userId: user._id,
        policyId: policy._id,
        eventKey,
      });

      if (existingClaim) {
        continue;
      }

      const fraudAssessment = evaluateFraud(user, snapshot, simulationOptions);
      const payout = claimPayout(user, policy, candidate.triggerType, severity);
      const claimStatus = fraudAssessment.status === "FLAGGED" ? "flagged" : "paid";
      const payoutReference = `${(
        simulationOptions.gatewayId ||
        policy.payoutGatewayId ||
        user.preferredPayoutRail ||
        "upi"
      ).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const claimDraft = {
        userId: user._id,
        policyId: policy._id,
        eventKey,
        triggerType: candidate.triggerType,
        status: claimStatus,
        lossHours: payout.lossHours,
        payoutAmount: payout.payoutAmount,
        payoutReference,
        requestedGatewayId:
          simulationOptions.gatewayId ||
          policy.payoutGatewayId ||
          user.preferredPayoutRail ||
          "upi",
        explanation: `${candidate.narrative} Claim automation evaluated telemetry, historical weather patterns, and payout readiness.`,
        fraudAssessment: {
          score: fraudAssessment.score,
          status: fraudAssessment.status,
          reasons: fraudAssessment.reasons,
          confidence: fraudAssessment.confidence,
          modelVersion: fraudAssessment.modelVersion,
          features: fraudAssessment.features,
          historicalContext: fraudAssessment.historicalContext,
        },
        triggerSnapshot: snapshot,
        simulationProfile: simulationOptions.fraudPresetId || "clean",
        paidAt: claimStatus === "paid" ? new Date().toISOString() : null,
      };
      const payoutSimulation =
        claimStatus === "paid"
          ? buildPayoutSimulation(user, claimDraft, policy)
          : null;

      triggerEvents.push({
        userId: user._id,
        policyId: policy._id,
        eventKey,
        triggerType: candidate.triggerType,
        severity,
        narrative: candidate.narrative,
        source: candidate.source,
        scenarioId: scenario.id,
        snapshot,
      });

      createdClaims.push({
        ...claimDraft,
        payout: payoutSimulation,
      });
    }
  }

  if (triggerEvents.length) {
    await repositories.triggers.createMany(triggerEvents);
  }

  const persistedClaims = [];

  for (const claim of createdClaims) {
    const storedClaim = await repositories.claims.create(claim);
    persistedClaims.push(storedClaim);
  }

  if (persistedClaims.length) {
    const lastClaim = persistedClaims[0];
    await repositories.users.updateById(user._id, {
      trustScore:
        lastClaim?.fraudAssessment?.status === "APPROVED"
          ? clamp((user.trustScore || 80) + 2, 35, 99)
          : clamp((user.trustScore || 80) - Math.max(4, Math.round((lastClaim?.fraudAssessment?.score || 0) / 12)), 35, 99),
      telemetryProfile: {
        ...(user.telemetryProfile || {}),
        ...(simulationOptions.persistTelemetry ? simulationOptions.telemetryProfile : {}),
        claimFrequency:
          (user.telemetryProfile?.claimFrequency || 0) + persistedClaims.length,
      },
    });
  }

  return {
    scenario,
    triggerEvents,
    claims: persistedClaims,
    liveSnapshot: buildSignalSnapshot(user, scenario.id),
  };
}

export async function runAutomationForAllActivePolicies(repositories) {
  const activePolicies = await repositories.policies.listActive();
  const users = await repositories.users.list();
  const policiesByUserId = activePolicies.reduce((accumulator, policy) => {
    const list = accumulator.get(policy.userId) || [];
    list.push(policy);
    accumulator.set(policy.userId, list);
    return accumulator;
  }, new Map());

  for (const user of users) {
    const policies = policiesByUserId.get(user._id) || [];
    if (!policies.length) {
      continue;
    }

    await runAutomationForUser(repositories, user, policies, "balanced-day");
  }
}
