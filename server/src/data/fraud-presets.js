export const fraudPresets = [
  {
    id: "clean",
    label: "Clean telemetry",
    description:
      "Normal rider telemetry with matching GPS, healthy device confidence, and no suspicious declaration gaps.",
    telemetryProfile: {
      gpsLocation: "matched",
      networkLocation: "matched",
      gpsDriftKm: 0.6,
      routeDeviationScore: 5,
      movement: "active",
      staticMinutes: 6,
      routeSpeedKph: 34,
      deviceIntegrityConfidence: 0.94,
      claimFrequency: 0,
      inSuspiciousCluster: false,
      weatherReportConfidence: 0.92,
      reportedRainMm: null,
      riderDeclaredConditions: "aligned",
    },
  },
  {
    id: "gps-spoof",
    label: "GPS spoof attempt",
    description:
      "The rider device reports a mismatched route footprint and low integrity confidence, suggesting location spoofing.",
    telemetryProfile: {
      gpsLocation: "sector-11",
      networkLocation: "sector-3",
      gpsDriftKm: 11.8,
      routeDeviationScore: 27,
      movement: "static",
      staticMinutes: 44,
      routeSpeedKph: 4,
      deviceIntegrityConfidence: 0.41,
      claimFrequency: 2,
      inSuspiciousCluster: false,
      weatherReportConfidence: 0.72,
      reportedRainMm: null,
      riderDeclaredConditions: "route_mismatch",
    },
  },
  {
    id: "fake-weather",
    label: "Fake weather claim",
    description:
      "A rider exaggerates on-ground rain severity beyond the historical and current feed profile for the insured zone.",
    telemetryProfile: {
      gpsLocation: "matched",
      networkLocation: "matched",
      gpsDriftKm: 1.4,
      routeDeviationScore: 9,
      movement: "active",
      staticMinutes: 12,
      routeSpeedKph: 24,
      deviceIntegrityConfidence: 0.84,
      claimFrequency: 1,
      inSuspiciousCluster: false,
      weatherReportConfidence: 0.38,
      reportedRainMm: 148,
      riderDeclaredConditions: "declared_storm",
    },
  },
  {
    id: "cluster-risk",
    label: "Collusive cluster",
    description:
      "Multiple high-frequency claims from a suspicious cluster increase the anomaly score and trigger a manual review hold.",
    telemetryProfile: {
      gpsLocation: "matched",
      networkLocation: "matched",
      gpsDriftKm: 2.6,
      routeDeviationScore: 18,
      movement: "active",
      staticMinutes: 16,
      routeSpeedKph: 22,
      deviceIntegrityConfidence: 0.63,
      claimFrequency: 4,
      inSuspiciousCluster: true,
      weatherReportConfidence: 0.64,
      reportedRainMm: 92,
      riderDeclaredConditions: "cluster_pattern",
    },
  },
];

export function getFraudPresetById(presetId = "clean") {
  return fraudPresets.find((preset) => preset.id === presetId) || fraudPresets[0];
}
