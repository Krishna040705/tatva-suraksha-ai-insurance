import { getFraudPresetById } from "../data/fraud-presets.js";
import { buildWeatherBaseline } from "./analytics.service.js";
import { predictWithCentroids, trainCentroidClassifier } from "./ml.service.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value);
}

const trainingSamples = [
  {
    label: "legit",
    features: {
      gpsDriftKm: 0.4,
      routeDeviationScore: 4,
      staticMinutes: 5,
      rainMismatchMm: 3,
      claimFrequency: 0,
      deviceRisk: 0.06,
      clusterScore: 0.1,
      routeSpeedKph: 32,
    },
  },
  {
    label: "legit",
    features: {
      gpsDriftKm: 0.8,
      routeDeviationScore: 6,
      staticMinutes: 8,
      rainMismatchMm: 6,
      claimFrequency: 1,
      deviceRisk: 0.12,
      clusterScore: 0.15,
      routeSpeedKph: 27,
    },
  },
  {
    label: "legit",
    features: {
      gpsDriftKm: 1.2,
      routeDeviationScore: 9,
      staticMinutes: 11,
      rainMismatchMm: 8,
      claimFrequency: 1,
      deviceRisk: 0.18,
      clusterScore: 0.14,
      routeSpeedKph: 24,
    },
  },
  {
    label: "legit",
    features: {
      gpsDriftKm: 0.7,
      routeDeviationScore: 7,
      staticMinutes: 10,
      rainMismatchMm: 4,
      claimFrequency: 2,
      deviceRisk: 0.1,
      clusterScore: 0.16,
      routeSpeedKph: 30,
    },
  },
  {
    label: "fraud",
    features: {
      gpsDriftKm: 8.4,
      routeDeviationScore: 21,
      staticMinutes: 38,
      rainMismatchMm: 49,
      claimFrequency: 3,
      deviceRisk: 0.48,
      clusterScore: 0.52,
      routeSpeedKph: 9,
    },
  },
  {
    label: "fraud",
    features: {
      gpsDriftKm: 11.2,
      routeDeviationScore: 27,
      staticMinutes: 51,
      rainMismatchMm: 84,
      claimFrequency: 5,
      deviceRisk: 0.59,
      clusterScore: 0.75,
      routeSpeedKph: 5,
    },
  },
  {
    label: "fraud",
    features: {
      gpsDriftKm: 5.8,
      routeDeviationScore: 18,
      staticMinutes: 26,
      rainMismatchMm: 63,
      claimFrequency: 4,
      deviceRisk: 0.42,
      clusterScore: 0.64,
      routeSpeedKph: 14,
    },
  },
  {
    label: "fraud",
    features: {
      gpsDriftKm: 13.8,
      routeDeviationScore: 34,
      staticMinutes: 58,
      rainMismatchMm: 102,
      claimFrequency: 6,
      deviceRisk: 0.7,
      clusterScore: 0.82,
      routeSpeedKph: 3,
    },
  },
];

const fraudModel = trainCentroidClassifier(trainingSamples);

function buildTelemetryProfile(user, simulationOptions = {}) {
  const preset = getFraudPresetById(simulationOptions.fraudPresetId);

  return {
    ...(user.telemetryProfile || {}),
    ...(preset.telemetryProfile || {}),
    ...(simulationOptions.telemetryProfile || {}),
  };
}

function buildFeatureVector(user, snapshot, simulationOptions = {}) {
  const telemetry = buildTelemetryProfile(user, simulationOptions);
  const baseline = buildWeatherBaseline(user);
  const reportedRainMm =
    telemetry.reportedRainMm === null || telemetry.reportedRainMm === undefined
      ? snapshot.rainfallMm
      : telemetry.reportedRainMm;
  const rainMismatchMm = Math.abs(reportedRainMm - snapshot.rainfallMm);
  const historicalRainGapMm = Math.abs(reportedRainMm - baseline.rainAverage);
  const deviceRisk = 1 - (telemetry.deviceIntegrityConfidence || 0.5);
  const clusterScore = telemetry.inSuspiciousCluster ? 0.85 : 0.14;

  return {
    telemetry,
    baseline,
    features: {
      gpsDriftKm: Number(telemetry.gpsDriftKm || 0.8),
      routeDeviationScore: Number(telemetry.routeDeviationScore || 6),
      staticMinutes:
        telemetry.movement === "static"
          ? Number(telemetry.staticMinutes || 34)
          : Number(telemetry.staticMinutes || 8),
      rainMismatchMm: Math.max(rainMismatchMm, historicalRainGapMm * 0.55),
      claimFrequency: Number(telemetry.claimFrequency || 0),
      deviceRisk,
      clusterScore,
      routeSpeedKph: Number(telemetry.routeSpeedKph || 28),
    },
    reportedRainMm,
  };
}

function buildReasons({ telemetry, snapshot, baseline, reportedRainMm, features }) {
  const reasons = [];

  if ((telemetry.gpsLocation || "matched") !== (telemetry.networkLocation || "matched")) {
    reasons.push("GPS and network routes diverge beyond the worker's usual corridor.");
  }

  if (features.gpsDriftKm >= 5) {
    reasons.push("GPS spoof likelihood is elevated because route drift exceeded 5 km.");
  }

  if (features.staticMinutes >= 30) {
    reasons.push("Movement stayed static for unusually long during covered earning hours.");
  }

  if (features.deviceRisk >= 0.4) {
    reasons.push("Device integrity confidence dropped below the safe automation threshold.");
  }

  if (
    reportedRainMm > baseline.rainP95 + 18 &&
    reportedRainMm > snapshot.rainfallMm + 18
  ) {
    reasons.push(
      "Declared rainfall was materially above both the live feed and the historical weather band for this zone.",
    );
  }

  if ((telemetry.weatherReportConfidence || 1) < 0.5) {
    reasons.push("Weather evidence confidence is weak for the declared loss event.");
  }

  if (features.claimFrequency >= 3) {
    reasons.push("Claim frequency exceeded the expected weekly pattern for comparable riders.");
  }

  if (telemetry.inSuspiciousCluster) {
    reasons.push("The rider is linked to a suspicious claims cluster under portfolio review.");
  }

  if (!reasons.length) {
    reasons.push("No strong anomaly signatures were detected across telemetry and historical weather baselines.");
  }

  return reasons;
}

export function evaluateFraud(user, snapshot, simulationOptions = {}) {
  const { telemetry, baseline, features, reportedRainMm } = buildFeatureVector(
    user,
    snapshot,
    simulationOptions,
  );
  const prediction = predictWithCentroids(fraudModel, features);
  const fraudProbability =
    prediction.label === "fraud"
      ? prediction.certainty
      : 1 - prediction.certainty + 0.08;
  const score = clamp(round(fraudProbability * 100), 4, 99);
  const status = score >= 58 ? "FLAGGED" : "APPROVED";
  const nextTrustScore =
    status === "APPROVED"
      ? clamp((user.trustScore || 80) + 2, 35, 99)
      : clamp((user.trustScore || 80) - Math.max(4, Math.round(score / 12)), 35, 99);

  return {
    score,
    status,
    reasons: buildReasons({
      telemetry,
      snapshot,
      baseline,
      reportedRainMm,
      features,
    }),
    nextTrustScore,
    confidence: Number(prediction.certainty.toFixed(2)),
    modelVersion: "centroid-anomaly-v2",
    telemetry,
    features,
    historicalContext: {
      averageRainMm: baseline.rainAverage,
      p95RainMm: baseline.rainP95,
    },
  };
}
