function severityClass(value, type) {
  if (type === "aqi") {
    return value >= 280 ? "critical" : value >= 200 ? "watch" : "safe";
  }

  if (type === "curfewLevel") {
    return value >= 70 ? "critical" : value >= 45 ? "watch" : "safe";
  }

  return value >= 72 ? "critical" : value >= 48 ? "watch" : "safe";
}

const signalMeta = [
  { key: "rainfallMm", label: "Rainfall", unit: "mm", type: "weather" },
  { key: "waterloggingIndex", label: "Flood Index", unit: "/100", type: "weather" },
  { key: "heatIndex", label: "Heat Index", unit: "deg C", type: "weather" },
  { key: "aqi", label: "AQI", unit: "", type: "aqi" },
  { key: "curfewLevel", label: "Curfew Risk", unit: "/100", type: "curfewLevel" },
];

export default function LiveSignals({ snapshot }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <span className="eyebrow">Automation & Protection</span>
        <h2>Live disruption monitor</h2>
        <p>
          Five automated trigger streams watch for the conditions that cause loss
          of income.
        </p>
      </div>

      <div className="signal-grid">
        {signalMeta.map((signal) => (
          <article
            className={`signal-card ${severityClass(
              snapshot[signal.key],
              signal.type,
            )}`}
            key={signal.key}
          >
            <span>{signal.label}</span>
            <strong>
              {snapshot[signal.key]}
              {signal.unit}
            </strong>
            <small>{snapshot.zoneLabel}</small>
          </article>
        ))}
      </div>

      <div className="provider-strip">
        {snapshot.providers.map((provider) => (
          <span className="chip" key={provider.name}>
            {provider.name}: {provider.mode}
          </span>
        ))}
      </div>
    </section>
  );
}
