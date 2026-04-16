function statusClass(value, threshold, watchThreshold) {
  if (value >= threshold) {
    return "critical";
  }

  if (value >= watchThreshold) {
    return "watch";
  }

  return "safe";
}

const signalMeta = [
  {
    key: "rainfallMm",
    label: "Rainfall",
    unit: "mm",
    thresholdKey: "heavy_rain",
    watchFactor: 0.72,
  },
  {
    key: "waterloggingIndex",
    label: "Flood index",
    unit: "/100",
    thresholdKey: "flooding",
    watchFactor: 0.72,
  },
  {
    key: "heatIndex",
    label: "Heat index",
    unit: "deg C",
    thresholdKey: "extreme_heat",
    watchFactor: 0.9,
  },
  {
    key: "aqi",
    label: "AQI",
    unit: "",
    thresholdKey: "air_pollution",
    watchFactor: 0.7,
  },
  {
    key: "curfewLevel",
    label: "Curfew risk",
    unit: "/100",
    thresholdKey: "curfew",
    watchFactor: 0.7,
  },
];

export default function LiveSignals({ snapshot }) {
  return (
    <section className="panel-surface">
      <div className="panel-heading">
        <span className="section-kicker">Live disruption monitor</span>
        <h3>Parametric triggers watching the worker zone</h3>
        <p>
          External feeds continuously monitor weather, civic restrictions, and
          operating safety conditions before a worker ever has to file a form.
        </p>
      </div>

      <div className="signal-grid">
        {signalMeta.map((signal) => {
          const threshold = snapshot.thresholds[signal.thresholdKey];
          const value = snapshot[signal.key];

          return (
            <article
              className={`signal-card ${statusClass(
                value,
                threshold,
                threshold * signal.watchFactor,
              )}`}
              key={signal.key}
            >
              <div>
                <span>{signal.label}</span>
                <strong>
                  {value}
                  {signal.unit}
                </strong>
              </div>
              <small>
                Trigger at {threshold}
                {signal.unit}
              </small>
            </article>
          );
        })}
      </div>

      <div className="provider-strip">
        {snapshot.providers.map((provider) => (
          <span className="provider-chip" key={provider.name}>
            {provider.name}
            <strong>{provider.mode}</strong>
          </span>
        ))}
      </div>
    </section>
  );
}
