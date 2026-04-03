export default function ScenarioLab({
  scenarios,
  scenarioResult,
  loading,
  onSimulate,
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <span className="eyebrow">Automated Triggers</span>
        <h2>Scenario lab</h2>
        <p>
          Stress-test the policy using mock public feeds for rain, flooding,
          heat, AQI, and curfew disruptions.
        </p>
      </div>

      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <article className="scenario-card" key={scenario.id}>
            <div>
              <h3>{scenario.name}</h3>
              <p>{scenario.description}</p>
            </div>
            <button
              className="secondary-button"
              disabled={loading}
              type="button"
              onClick={() => onSimulate(scenario.id)}
            >
              Run Scenario
            </button>
          </article>
        ))}
      </div>

      {scenarioResult ? (
        <div className="subpanel">
          <div className="subpanel-row">
            <div>
              <h3>{scenarioResult.scenario.name}</h3>
              <p>{scenarioResult.scenario.narrative}</p>
            </div>
            <div className="chip-row">
              <span className="chip">
                Triggered events: {scenarioResult.triggerEvents.length}
              </span>
              <span className="chip">
                Claims created: {scenarioResult.claims.length}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
