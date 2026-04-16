import {
  cityProfiles,
  getScenarioById,
  triggerLossHours,
  triggerThresholds,
  zoneProfiles,
} from "../data/scenarios.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Math.round(value);
}

function citySeed(city) {
  return [...String(city || "city")].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
}

function weekFactor(seed, weekIndex) {
  return Math.sin((seed + weekIndex * 3) / 3.2) + Math.cos((seed + weekIndex) / 5.3);
}

export function buildHistoricalWeatherSeries(user, weeks = 12) {
  const city = cityProfiles[user.city] || cityProfiles.Bengaluru;
  const zone = zoneProfiles[user.zoneType] || zoneProfiles.moderate;
  const seed = citySeed(user.city || "Bengaluru");

  return Array.from({ length: weeks }, (_, index) => {
    const weekIndex = weeks - index;
    const oscillation = weekFactor(seed, weekIndex);
    const rainfallMm = clamp(
      round(city.rainBase + zone.rainfallVolatility * 28 + oscillation * 11 + weekIndex),
      0,
      160,
    );
    const waterloggingIndex = clamp(
      round(city.floodBase + zone.waterloggingRisk * 29 + oscillation * 7),
      0,
      100,
    );
    const heatIndex = clamp(
      round(city.heatBase + zone.heatRisk * 6 + oscillation * 2.3),
      24,
      54,
    );
    const aqi = clamp(
      round(city.aqiBase + zone.pollutionRisk * 52 + oscillation * 16),
      40,
      420,
    );
    const curfewLevel = clamp(
      round(city.curfewBase + zone.curfewRisk * 38 + Math.max(0, oscillation) * 9),
      0,
      100,
    );

    return {
      weekLabel: `W-${weekIndex}`,
      rainfallMm,
      waterloggingIndex,
      heatIndex,
      aqi,
      curfewLevel,
    };
  });
}

export function buildWeatherBaseline(user) {
  const history = buildHistoricalWeatherSeries(user, 10);
  const rainfall = history.map((entry) => entry.rainfallMm);
  const sortedRainfall = [...rainfall].sort((left, right) => left - right);

  return {
    history,
    rainAverage: round(rainfall.reduce((sum, value) => sum + value, 0) / history.length),
    rainP95: sortedRainfall[Math.floor(sortedRainfall.length * 0.9)] || sortedRainfall.at(-1) || 0,
  };
}

function triggerProbability(metric, threshold, uplift = 0) {
  return clamp(metric / threshold * 0.62 + uplift, 0.04, 0.96);
}

export function buildWorkerForecast(user, policy, snapshot) {
  const baseline = buildWeatherBaseline(user);
  const latestHistory = baseline.history.slice(-4);
  const recentAverageRain = meanMetric(latestHistory, "rainfallMm");
  const recentAverageFlood = meanMetric(latestHistory, "waterloggingIndex");
  const recentAverageHeat = meanMetric(latestHistory, "heatIndex");
  const recentAverageAqi = meanMetric(latestHistory, "aqi");
  const recentAverageCurfew = meanMetric(latestHistory, "curfewLevel");

  const probabilities = [
    {
      triggerType: "heavy_rain",
      label: "Heavy rain",
      probability: triggerProbability(
        snapshot.rainfallMm * 0.58 + recentAverageRain * 0.42,
        triggerThresholds.heavy_rain,
      ),
      expectedLossHours: triggerLossHours.heavy_rain,
    },
    {
      triggerType: "flooding",
      label: "Flooding",
      probability: triggerProbability(
        snapshot.waterloggingIndex * 0.6 + recentAverageFlood * 0.4,
        triggerThresholds.flooding,
      ),
      expectedLossHours: triggerLossHours.flooding,
    },
    {
      triggerType: "extreme_heat",
      label: "Extreme heat",
      probability: triggerProbability(
        snapshot.heatIndex * 0.7 + recentAverageHeat * 0.3,
        triggerThresholds.extreme_heat,
      ),
      expectedLossHours: triggerLossHours.extreme_heat,
    },
    {
      triggerType: "air_pollution",
      label: "Air pollution",
      probability: triggerProbability(
        snapshot.aqi * 0.68 + recentAverageAqi * 0.32,
        triggerThresholds.air_pollution,
      ),
      expectedLossHours: triggerLossHours.air_pollution,
    },
    {
      triggerType: "curfew",
      label: "Curfew",
      probability: triggerProbability(
        snapshot.curfewLevel * 0.78 + recentAverageCurfew * 0.22,
        triggerThresholds.curfew,
      ),
      expectedLossHours: triggerLossHours.curfew,
    },
  ]
    .map((entry) => ({
      ...entry,
      likelihoodLabel:
        entry.probability >= 0.72
          ? "High"
          : entry.probability >= 0.45
            ? "Watch"
            : "Low",
    }))
    .sort((left, right) => right.probability - left.probability);

  const topRisk = probabilities[0];
  const hourlyIncome = (user.weeklyIncome || 0) / 54;
  const expectedProtectedIncome = policy
    ? round(
        probabilities.reduce((sum, item) => {
          const coveredLossHours = Math.min(
            policy.coverageHours || 0,
            item.expectedLossHours,
          );

          return sum + coveredLossHours * hourlyIncome * item.probability;
        }, 0),
      )
    : 0;

  return {
    topRisk,
    probabilities,
    expectedProtectedIncome,
    forecastConfidence: clamp(0.64 + topRisk.probability * 0.22, 0.68, 0.95),
    baseline,
  };
}

function meanMetric(items, key) {
  if (!items.length) {
    return 0;
  }

  return items.reduce((sum, item) => sum + item[key], 0) / items.length;
}

function safeMoney(value) {
  return Math.max(0, round(value || 0));
}

export function buildPortfolioForecast(users, activePolicies) {
  const byTrigger = new Map();
  const byCity = new Map();
  let expectedClaims = 0;
  let expectedPayouts = 0;

  users.forEach((user) => {
    const policy = activePolicies.find((entry) => entry.userId === user._id);

    if (!policy) {
      return;
    }

    const scenario = getScenarioById("balanced-day");
    const snapshot = {
      rainfallMm: round((cityProfiles[user.city]?.rainBase || 24) + scenario.modifiers.rain + 18),
      waterloggingIndex: round((cityProfiles[user.city]?.floodBase || 18) + 20),
      heatIndex: round((cityProfiles[user.city]?.heatBase || 34) + 3),
      aqi: round((cityProfiles[user.city]?.aqiBase || 110) + 28),
      curfewLevel: round((cityProfiles[user.city]?.curfewBase || 8) + 6),
    };
    const forecast = buildWorkerForecast(user, policy, snapshot);
    const topRisk = forecast.topRisk;
    const expectedPayout = safeMoney(
      forecast.expectedProtectedIncome * (topRisk.probability * 0.8),
    );

    expectedClaims += topRisk.probability;
    expectedPayouts += expectedPayout;

    byTrigger.set(topRisk.triggerType, {
      triggerType: topRisk.triggerType,
      label: topRisk.label,
      probability: topRisk.probability,
      expectedClaims: safeMoney((byTrigger.get(topRisk.triggerType)?.expectedClaims || 0) + topRisk.probability * 10) / 10,
    });

    byCity.set(user.city, {
      city: user.city,
      workersCovered: (byCity.get(user.city)?.workersCovered || 0) + 1,
      expectedPayouts:
        (byCity.get(user.city)?.expectedPayouts || 0) + expectedPayout,
    });
  });

  return {
    expectedClaims: Number(expectedClaims.toFixed(1)),
    expectedPayouts: safeMoney(expectedPayouts),
    likelyTriggers: [...byTrigger.values()].sort(
      (left, right) => right.probability - left.probability,
    ),
    cityRiskTable: [...byCity.values()].sort(
      (left, right) => right.expectedPayouts - left.expectedPayouts,
    ),
  };
}

export function buildBusinessMetrics(users, policies, claims) {
  const activePolicies = policies.filter((policy) => policy.status === "active");
  const weeklyPremiumPool = activePolicies.reduce(
    (sum, policy) => sum + (policy.dynamicPremium || 0),
    0,
  );
  const settledPayouts = claims
    .filter((claim) => claim.status === "paid")
    .reduce((sum, claim) => sum + (claim.payoutAmount || 0), 0);
  const flaggedClaims = claims.filter((claim) => claim.status === "flagged").length;
  const lossRatio = weeklyPremiumPool
    ? Number((settledPayouts / weeklyPremiumPool).toFixed(2))
    : 0;

  const socialImpact = {
    workersCovered: activePolicies.length,
    womenFriendlyCoverageScore: 84,
    lowBalanceWorkersProtected: users.filter((user) => (user.weeklyIncome || 0) <= 8000).length,
    noPaperworkRate: claims.length
      ? Number(
          (
            claims.filter((claim) => claim.status !== "rejected").length /
            claims.length
          ).toFixed(2),
        )
      : 1,
  };

  return {
    weeklyPremiumPool: safeMoney(weeklyPremiumPool),
    settledPayouts: safeMoney(settledPayouts),
    lossRatio,
    flaggedClaims,
    socialImpact,
  };
}
