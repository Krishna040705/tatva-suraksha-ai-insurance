import {
  cityProfiles,
  getScenarioById,
  triggerThresholds,
  zoneProfiles,
} from "../data/scenarios.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value);
}

function parseFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeCoverageAmount(value, fallback) {
  const parsed = parseFiniteNumber(value);

  if (parsed === null || parsed <= 0) {
    return fallback;
  }

  return Math.max(3000, round(parsed / 100) * 100);
}

function sanitizeCoverageHours(value, fallback) {
  const parsed = parseFiniteNumber(value);

  if (parsed === null || parsed <= 0) {
    return fallback;
  }

  return clamp(round(parsed), 20, 168);
}

function citySeed(city) {
  return [...city].reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function buildSignalSnapshot(user, scenarioId = "balanced-day") {
  const zone = zoneProfiles[user.zoneType] || zoneProfiles.moderate;
  const city = cityProfiles[user.city] || cityProfiles.Bengaluru;
  const scenario = getScenarioById(scenarioId);
  const timeFactor = new Date().getDay() + 1;
  const seed = citySeed(user.city) % 11;

  const rainfallMm = clamp(
    round(
      city.rainBase * 0.55 +
        zone.rainfallVolatility * 22 +
        scenario.modifiers.rain +
        timeFactor +
        seed,
    ),
    0,
    180,
  );

  const waterloggingIndex = clamp(
    round(
      city.floodBase * 0.6 +
        zone.waterloggingRisk * 26 +
        scenario.modifiers.flood +
        seed,
    ),
    0,
    100,
  );

  const heatIndex = clamp(
    round(
      city.heatBase + zone.heatRisk * 7 + scenario.modifiers.heat + seed * 0.3,
    ),
    24,
    54,
  );

  const aqi = clamp(
    round(
      city.aqiBase * 0.7 +
        zone.pollutionRisk * 85 +
        scenario.modifiers.aqi +
        seed * 2,
    ),
    40,
    500,
  );

  const curfewLevel = clamp(
    round(
      city.curfewBase +
        zone.curfewRisk * 100 +
        scenario.modifiers.curfew +
        seed,
    ),
    0,
    100,
  );

  return {
    scenario,
    zoneLabel: zone.label,
    rainfallMm,
    waterloggingIndex,
    heatIndex,
    aqi,
    curfewLevel,
    providers: [
      { name: "Weather Feed", mode: "mock", value: rainfallMm },
      { name: "Flood Alert Feed", mode: "mock", value: waterloggingIndex },
      { name: "Heat Forecast Feed", mode: "mock", value: heatIndex },
      { name: "AQI Feed", mode: "mock", value: aqi },
      { name: "Civic Restriction Feed", mode: "mock", value: curfewLevel },
    ],
    thresholds: triggerThresholds,
    refreshedAt: new Date().toISOString(),
  };
}

export function buildPremiumQuote(user, options = {}, scenarioId = "balanced-day") {
  const snapshot = buildSignalSnapshot(user, scenarioId);
  const defaultCoverageAmount = Math.max(
    3000,
    Math.round((user.weeklyIncome * 0.72) / 100) * 100,
  );
  const coverageAmount = sanitizeCoverageAmount(
    options.coverageAmount,
    defaultCoverageAmount,
  );

  const basePremium = Math.max(35, Math.round(coverageAmount / 100));
  const factorNotes = [];
  let adjustment = 0;

  if (user.zoneType === "safe") {
    adjustment -= 2;
    factorNotes.push("Safe operating zone discount: -Rs 2/week");
  }

  if (user.zoneType === "moderate") {
    adjustment += 2;
    factorNotes.push("Mixed-risk zone loading: +Rs 2/week");
  }

  if (user.zoneType === "high-risk") {
    adjustment += 6;
    factorNotes.push("High disruption zone loading: +Rs 6/week");
  }

  if (snapshot.waterloggingIndex >= 60) {
    adjustment += 4;
    factorNotes.push("Frequent waterlogging exposure: +Rs 4/week");
  }

  if (snapshot.rainfallMm >= 55) {
    adjustment += 3;
    factorNotes.push("Rainfall volatility adjustment: +Rs 3/week");
  }

  if (snapshot.heatIndex >= 40) {
    adjustment += 2;
    factorNotes.push("Extreme heat coverage boost: +Rs 2/week");
  }

  if (snapshot.aqi >= 220) {
    adjustment += 3;
    factorNotes.push("High pollution risk loading: +Rs 3/week");
  }

  if (snapshot.curfewLevel >= 50) {
    adjustment += 5;
    factorNotes.push("Curfew interruption loading: +Rs 5/week");
  }

  if ((user.trustScore || 80) >= 88) {
    adjustment -= 1;
    factorNotes.push("Strong trust score reward: -Rs 1/week");
  }

  const riskScore = clamp(
    round(
      snapshot.rainfallMm * 0.24 +
        snapshot.waterloggingIndex * 0.2 +
        snapshot.heatIndex * 1.1 +
        snapshot.aqi * 0.12 +
        snapshot.curfewLevel * 0.32,
    ),
    18,
    99,
  );

  const riskBand =
    riskScore < 45 ? "low" : riskScore < 72 ? "medium" : "high";
  const defaultCoverageHours =
    riskBand === "high" ? 60 : riskBand === "medium" ? 52 : 44;
  const coverageHours = sanitizeCoverageHours(
    options.coverageHours,
    defaultCoverageHours,
  );

  const dynamicPremium = clamp(basePremium + adjustment, 35, 99);

  return {
    planName: "Income Shield Weekly",
    coverageAmount,
    coverageHours,
    basePremium,
    dynamicPremium,
    riskScore,
    riskBand,
    factors: factorNotes,
    nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    snapshot,
  };
}
