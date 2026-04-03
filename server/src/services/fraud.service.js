function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function evaluateFraud(user) {
  const telemetry = user.telemetryProfile || {};
  let score = 0;
  const reasons = [];

  if (
    telemetry.gpsLocation &&
    telemetry.networkLocation &&
    telemetry.gpsLocation !== telemetry.networkLocation
  ) {
    score += 1;
    reasons.push("GPS and network locations do not align.");
  }

  if (telemetry.movement === "static") {
    score += 1;
    reasons.push("Device movement stayed static during active earning hours.");
  }

  if ((telemetry.claimFrequency || 0) >= 3) {
    score += 1;
    reasons.push("Recent claim frequency exceeded the expected weekly pattern.");
  }

  if (telemetry.inSuspiciousCluster) {
    score += 2;
    reasons.push("Behavior matched a suspicious activity cluster.");
  }

  if ((user.trustScore || 80) < 60) {
    score += 1;
    reasons.push("Trust score was already below the fair-operations threshold.");
  }

  const status = score >= 3 ? "FLAGGED" : "APPROVED";
  const nextTrustScore =
    status === "APPROVED"
      ? clamp((user.trustScore || 80) + 2, 35, 99)
      : clamp((user.trustScore || 80) - score * 4, 35, 99);

  return {
    score,
    status,
    reasons,
    nextTrustScore,
  };
}
