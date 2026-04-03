export const zoneProfiles = {
  safe: {
    label: "Low Waterlogging Zone",
    waterloggingRisk: 0.18,
    rainfallVolatility: 0.25,
    heatRisk: 0.38,
    pollutionRisk: 0.22,
    curfewRisk: 0.12,
  },
  moderate: {
    label: "Mixed Risk Zone",
    waterloggingRisk: 0.42,
    rainfallVolatility: 0.46,
    heatRisk: 0.55,
    pollutionRisk: 0.48,
    curfewRisk: 0.2,
  },
  "high-risk": {
    label: "High Disruption Zone",
    waterloggingRisk: 0.74,
    rainfallVolatility: 0.71,
    heatRisk: 0.68,
    pollutionRisk: 0.61,
    curfewRisk: 0.33,
  },
};

export const cityProfiles = {
  Bengaluru: {
    rainBase: 26,
    heatBase: 33,
    aqiBase: 112,
    curfewBase: 8,
    floodBase: 24,
  },
  Mumbai: {
    rainBase: 54,
    heatBase: 32,
    aqiBase: 124,
    curfewBase: 10,
    floodBase: 48,
  },
  Chennai: {
    rainBase: 22,
    heatBase: 37,
    aqiBase: 98,
    curfewBase: 7,
    floodBase: 22,
  },
  Delhi: {
    rainBase: 18,
    heatBase: 39,
    aqiBase: 188,
    curfewBase: 14,
    floodBase: 16,
  },
  Hyderabad: {
    rainBase: 20,
    heatBase: 36,
    aqiBase: 124,
    curfewBase: 9,
    floodBase: 18,
  },
};

export const disruptionScenarios = [
  {
    id: "balanced-day",
    name: "Balanced Day",
    description:
      "Normal operating conditions with mild weather and no severe disruption.",
    narrative:
      "Workers can operate with regular demand and only routine traffic slowdowns.",
    modifiers: {
      rain: 0,
      flood: 0,
      heat: 0,
      aqi: 0,
      curfew: 0,
    },
  },
  {
    id: "monsoon-surge",
    name: "Monsoon Surge",
    description:
      "Intense rainfall and waterlogging create delivery downtime across wet zones.",
    narrative:
      "Hyper-local rainfall spikes and waterlogging alerts trigger income protection.",
    modifiers: {
      rain: 42,
      flood: 36,
      heat: -4,
      aqi: 10,
      curfew: 0,
    },
  },
  {
    id: "heatwave-lock",
    name: "Heatwave Lock",
    description:
      "Extreme heat index reduces safe riding hours during peak afternoon demand.",
    narrative:
      "High heat and humidity reduce safe coverage windows for outdoor gig workers.",
    modifiers: {
      rain: -8,
      flood: -12,
      heat: 10,
      aqi: 16,
      curfew: 0,
    },
  },
  {
    id: "smog-spike",
    name: "Smog Spike",
    description:
      "Severe AQI degrades working conditions and suppresses platform activity.",
    narrative:
      "Air pollution remains elevated for long enough to hit worker earnings.",
    modifiers: {
      rain: 0,
      flood: 0,
      heat: 2,
      aqi: 148,
      curfew: 0,
    },
  },
  {
    id: "city-curfew",
    name: "Curfew Window",
    description:
      "A local administrative restriction sharply cuts operating hours and earnings.",
    narrative:
      "Restricted service windows trigger parametric claims without filing paperwork.",
    modifiers: {
      rain: 8,
      flood: 4,
      heat: 0,
      aqi: 8,
      curfew: 74,
    },
  },
];

export const triggerThresholds = {
  heavy_rain: 70,
  flooding: 72,
  extreme_heat: 42,
  air_pollution: 280,
  curfew: 70,
};

export const triggerLossHours = {
  heavy_rain: 8,
  flooding: 12,
  extreme_heat: 6,
  air_pollution: 7,
  curfew: 18,
};

export function getScenarioById(scenarioId) {
  return (
    disruptionScenarios.find((scenario) => scenario.id === scenarioId) ||
    disruptionScenarios[0]
  );
}
