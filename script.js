const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const cityBase = {
  Bengaluru: { rain: 26, flood: 24, heat: 33, aqi: 112, curfew: 8 },
  Mumbai: { rain: 54, flood: 48, heat: 32, aqi: 124, curfew: 10 },
  Chennai: { rain: 22, flood: 22, heat: 37, aqi: 98, curfew: 7 },
  Delhi: { rain: 18, flood: 16, heat: 39, aqi: 188, curfew: 14 },
  Hyderabad: { rain: 20, flood: 18, heat: 36, aqi: 124, curfew: 9 },
};

const zoneBase = {
  safe: { rain: 6, flood: 8, heat: 3, aqi: 16, curfew: 6, premium: -2 },
  moderate: { rain: 14, flood: 14, heat: 5, aqi: 36, curfew: 20, premium: 2 },
  "high-risk": { rain: 22, flood: 22, heat: 7, aqi: 52, curfew: 42, premium: 6 },
};

const scenarios = [
  {
    id: "balanced-day",
    name: "Balanced Day",
    narrative:
      "Routine traffic and mild weather keep earnings close to normal operating conditions.",
    modifiers: { rain: 0, flood: 0, heat: 0, aqi: 0, curfew: 0 },
  },
  {
    id: "monsoon-surge",
    name: "Monsoon Surge",
    narrative:
      "Heavy rain and waterlogging shrink safe working hours and trigger automated protection.",
    modifiers: { rain: 38, flood: 34, heat: -2, aqi: 10, curfew: 0 },
  },
  {
    id: "heatwave-lock",
    name: "Heatwave Lock",
    narrative:
      "Outdoor work becomes unsafe during peak demand windows because of sustained heat.",
    modifiers: { rain: -8, flood: -10, heat: 10, aqi: 14, curfew: 0 },
  },
  {
    id: "smog-spike",
    name: "Smog Spike",
    narrative:
      "Air quality crosses safety thresholds and parametric coverage supports lost income.",
    modifiers: { rain: 0, flood: 0, heat: 1, aqi: 146, curfew: 0 },
  },
  {
    id: "city-curfew",
    name: "Curfew Window",
    narrative:
      "Administrative restrictions cut the service window, leading to income-loss support.",
    modifiers: { rain: 8, flood: 4, heat: 0, aqi: 6, curfew: 74 },
  },
];

const thresholds = {
  rainfallMm: 70,
  waterloggingIndex: 72,
  heatIndex: 42,
  aqi: 280,
  curfewLevel: 70,
};

const dom = {
  fullName: document.querySelector("#fullName"),
  city: document.querySelector("#city"),
  zoneType: document.querySelector("#zoneType"),
  weeklyIncome: document.querySelector("#weeklyIncome"),
  coverageAmount: document.querySelector("#coverageAmount"),
  coverageHours: document.querySelector("#coverageHours"),
  scenarioButtons: document.querySelector("#scenarioButtons"),
  premiumNarrative: document.querySelector("#premiumNarrative"),
  dynamicPremium: document.querySelector("#dynamicPremium"),
  basePremium: document.querySelector("#basePremium"),
  riskScore: document.querySelector("#riskScore"),
  riskBand: document.querySelector("#riskBand"),
  coverageSummary: document.querySelector("#coverageSummary"),
  factorList: document.querySelector("#factorList"),
  signalGrid: document.querySelector("#signalGrid"),
  claimIntro: document.querySelector("#claimIntro"),
  claimList: document.querySelector("#claimList"),
};

let selectedScenarioId = "monsoon-surge";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getSelectedScenario() {
  return scenarios.find((scenario) => scenario.id === selectedScenarioId) || scenarios[0];
}

function readProfile() {
  return {
    fullName: dom.fullName.value.trim() || "Aarav Singh",
    city: dom.city.value,
    zoneType: dom.zoneType.value,
    weeklyIncome: Number(dom.weeklyIncome.value) || 9000,
    coverageAmount: Math.max(3000, Number(dom.coverageAmount.value) || 6500),
    coverageHours: clamp(Number(dom.coverageHours.value) || 56, 20, 168),
  };
}

function buildSnapshot(profile, scenario) {
  const city = cityBase[profile.city];
  const zone = zoneBase[profile.zoneType];

  return {
    rainfallMm: clamp(city.rain + zone.rain + scenario.modifiers.rain, 0, 180),
    waterloggingIndex: clamp(city.flood + zone.flood + scenario.modifiers.flood, 0, 100),
    heatIndex: clamp(city.heat + zone.heat + scenario.modifiers.heat, 24, 54),
    aqi: clamp(city.aqi + zone.aqi + scenario.modifiers.aqi, 40, 500),
    curfewLevel: clamp(city.curfew + zone.curfew + scenario.modifiers.curfew, 0, 100),
  };
}

function buildQuote(profile, snapshot) {
  const basePremium = Math.max(35, Math.round(profile.coverageAmount / 100));
  let adjustment = zoneBase[profile.zoneType].premium;
  const factors = [];

  if (zoneBase[profile.zoneType].premium < 0) {
    factors.push("Safe operating zone discount: -Rs 2/week");
  }

  if (zoneBase[profile.zoneType].premium > 0) {
    factors.push(
      profile.zoneType === "moderate"
        ? "Mixed-risk zone loading: +Rs 2/week"
        : "High disruption zone loading: +Rs 6/week",
    );
  }

  if (snapshot.waterloggingIndex >= 60) {
    adjustment += 4;
    factors.push("Frequent waterlogging exposure: +Rs 4/week");
  }

  if (snapshot.rainfallMm >= 55) {
    adjustment += 3;
    factors.push("Rainfall volatility adjustment: +Rs 3/week");
  }

  if (snapshot.heatIndex >= 40) {
    adjustment += 2;
    factors.push("Extreme heat coverage boost: +Rs 2/week");
  }

  if (snapshot.aqi >= 220) {
    adjustment += 3;
    factors.push("High pollution risk loading: +Rs 3/week");
  }

  if (snapshot.curfewLevel >= 50) {
    adjustment += 5;
    factors.push("Curfew interruption loading: +Rs 5/week");
  }

  const riskScore = clamp(
    Math.round(
      snapshot.rainfallMm * 0.24 +
        snapshot.waterloggingIndex * 0.2 +
        snapshot.heatIndex * 1.1 +
        snapshot.aqi * 0.12 +
        snapshot.curfewLevel * 0.32,
    ),
    18,
    99,
  );

  return {
    basePremium,
    dynamicPremium: clamp(basePremium + adjustment, 35, 99),
    riskScore,
    riskBand: riskScore < 45 ? "low" : riskScore < 72 ? "medium" : "high",
    factors,
  };
}

function severityClass(value, threshold, warnFactor = 0.66) {
  if (value >= threshold) {
    return "critical";
  }

  if (value >= threshold * warnFactor) {
    return "watch";
  }

  return "safe";
}

function buildClaims(profile, snapshot) {
  const possibleClaims = [];

  if (snapshot.rainfallMm >= thresholds.rainfallMm) {
    possibleClaims.push({
      triggerType: "heavy rain",
      payoutAmount: Math.min(profile.coverageAmount, Math.round((profile.weeklyIncome / 54) * 10)),
      status: "paid",
      note: "Rain threshold crossed and automated payout executed.",
    });
  }

  if (snapshot.waterloggingIndex >= thresholds.waterloggingIndex) {
    possibleClaims.push({
      triggerType: "flooding",
      payoutAmount: Math.min(profile.coverageAmount, Math.round((profile.weeklyIncome / 54) * 13)),
      status: "paid",
      note: "Waterlogging signal confirmed zone-wide disruption.",
    });
  }

  if (snapshot.heatIndex >= thresholds.heatIndex) {
    possibleClaims.push({
      triggerType: "extreme heat",
      payoutAmount: Math.min(profile.coverageAmount, Math.round((profile.weeklyIncome / 54) * 7)),
      status: "flagged",
      note: "Heat event crossed threshold and was routed for fairness review.",
    });
  }

  if (snapshot.aqi >= thresholds.aqi) {
    possibleClaims.push({
      triggerType: "air pollution",
      payoutAmount: Math.min(profile.coverageAmount, Math.round((profile.weeklyIncome / 54) * 8)),
      status: "paid",
      note: "AQI stayed above the insured threshold long enough to trigger protection.",
    });
  }

  if (snapshot.curfewLevel >= thresholds.curfewLevel) {
    possibleClaims.push({
      triggerType: "curfew",
      payoutAmount: Math.min(profile.coverageAmount, Math.round((profile.weeklyIncome / 54) * 18)),
      status: "paid",
      note: "Administrative restrictions reduced service hours and triggered compensation.",
    });
  }

  return possibleClaims;
}

function renderScenarioButtons() {
  dom.scenarioButtons.innerHTML = "";

  scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.className = `scenario-button ${scenario.id === selectedScenarioId ? "active" : ""}`;
    button.type = "button";
    button.textContent = scenario.name;
    button.addEventListener("click", () => {
      selectedScenarioId = scenario.id;
      renderScenarioButtons();
      render();
    });
    dom.scenarioButtons.appendChild(button);
  });
}

function renderSignals(snapshot) {
  const signals = [
    { label: "Rainfall", value: snapshot.rainfallMm, unit: "mm", threshold: thresholds.rainfallMm },
    {
      label: "Flood Index",
      value: snapshot.waterloggingIndex,
      unit: "/100",
      threshold: thresholds.waterloggingIndex,
    },
    { label: "Heat Index", value: snapshot.heatIndex, unit: "deg C", threshold: thresholds.heatIndex },
    { label: "AQI", value: snapshot.aqi, unit: "", threshold: thresholds.aqi },
    {
      label: "Curfew Risk",
      value: snapshot.curfewLevel,
      unit: "/100",
      threshold: thresholds.curfewLevel,
    },
  ];

  dom.signalGrid.innerHTML = "";

  signals.forEach((signal) => {
    const card = document.createElement("article");
    card.className = `signal-card ${severityClass(signal.value, signal.threshold)}`;
    card.innerHTML = `
      <span>${signal.label}</span>
      <strong>${signal.value}${signal.unit}</strong>
      <span>Threshold ${signal.threshold}${signal.unit}</span>
    `;
    dom.signalGrid.appendChild(card);
  });
}

function renderClaims(profile, claims) {
  dom.claimIntro.textContent = `${profile.fullName} is being evaluated for automated income-loss support based on the selected disruption.`;
  dom.claimList.innerHTML = "";

  if (!claims.length) {
    const empty = document.createElement("article");
    empty.className = "claim-card";
    empty.innerHTML = `
      <div class="claim-header">
        <div>
          <h3>No claim triggered</h3>
          <p>The selected scenario stayed below insured thresholds for this profile.</p>
        </div>
      </div>
    `;
    dom.claimList.appendChild(empty);
    return;
  }

  claims.forEach((claim, index) => {
    const card = document.createElement("article");
    card.className = "claim-card";
    card.innerHTML = `
      <div class="claim-header">
        <div>
          <h3>${claim.triggerType}</h3>
          <p>${claim.note}</p>
        </div>
        <span class="status-pill ${claim.status}">${claim.status}</span>
      </div>
      <div class="claim-meta">
        <span>Payout ${currency(claim.payoutAmount)}</span>
        <span>Reference UPI-${String(index + 1).padStart(4, "0")}</span>
      </div>
    `;
    dom.claimList.appendChild(card);
  });
}

function render() {
  const profile = readProfile();
  const scenario = getSelectedScenario();
  const snapshot = buildSnapshot(profile, scenario);
  const quote = buildQuote(profile, snapshot);
  const claims = buildClaims(profile, snapshot);

  dom.premiumNarrative.textContent = scenario.narrative;
  dom.dynamicPremium.textContent = `${currency(quote.dynamicPremium)} / week`;
  dom.basePremium.textContent = currency(quote.basePremium);
  dom.riskScore.textContent = String(quote.riskScore);
  dom.riskBand.textContent = quote.riskBand;
  dom.coverageSummary.textContent = `${currency(profile.coverageAmount)} / ${profile.coverageHours} hrs`;
  dom.factorList.innerHTML = "";

  (quote.factors.length ? quote.factors : ["Balanced conditions keep premium adjustments minimal."]).forEach(
    (factor) => {
      const item = document.createElement("p");
      item.textContent = factor;
      dom.factorList.appendChild(item);
    },
  );

  renderSignals(snapshot);
  renderClaims(profile, claims);
}

[
  dom.fullName,
  dom.city,
  dom.zoneType,
  dom.weeklyIncome,
  dom.coverageAmount,
  dom.coverageHours,
].forEach((input) => input.addEventListener("input", render));

renderScenarioButtons();
render();
