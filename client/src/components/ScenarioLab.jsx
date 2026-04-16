import { currency, titleCase } from "../formatters.js";

export default function ScenarioLab({
  scenarios,
  fraudPresets,
  gatewayOptions,
  simulationForm,
  scenarioResult,
  loading,
  onFieldChange,
  onSimulate,
}) {
  return (
    <section className="panel-surface">
      <div className="panel-heading">
        <span className="section-kicker">Scenario lab</span>
        <h3>Trigger disruption, ML fraud review, and instant payout</h3>
        <p>
          Judges can simulate monsoon, heat, smog, or curfew events and pair them
          with clean or suspicious telemetry profiles to show automated approvals
          and fraud holds.
        </p>
      </div>

      <div className="lab-controls">
        <label>
          Fraud simulation profile
          <select
            name="fraudPresetId"
            onChange={onFieldChange}
            value={simulationForm.fraudPresetId}
          >
            {fraudPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Payout gateway
          <select
            name="gatewayId"
            onChange={onFieldChange}
            value={simulationForm.gatewayId}
          >
            {gatewayOptions.map((gateway) => (
              <option key={gateway.id} value={gateway.id}>
                {gateway.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <article className="scenario-card" key={scenario.id}>
            <div>
              <span className="scenario-label">{scenario.name}</span>
              <h4>{scenario.description}</h4>
              <p>{scenario.narrative}</p>
            </div>
            <button
              className="secondary-button"
              disabled={loading}
              type="button"
              onClick={() => onSimulate(scenario.id)}
            >
              Run {scenario.name}
            </button>
          </article>
        ))}
      </div>

      {scenarioResult ? (
        <div className="result-panel">
          <div className="result-header">
            <div>
              <span className="section-kicker">Last simulation</span>
              <h4>{scenarioResult.scenario.name}</h4>
              <p>{scenarioResult.scenario.narrative}</p>
            </div>
            <div className="tag-row">
              <span className="info-pill">{scenarioResult.triggerEvents.length} trigger events</span>
              <span className="info-pill">{scenarioResult.claims.length} claims created</span>
            </div>
          </div>

          {scenarioResult.claims.length ? (
            <div className="metric-grid three-up">
              {scenarioResult.claims.slice(0, 3).map((claim) => (
                <article className="metric-tile" key={claim._id}>
                  <span>{titleCase(claim.triggerType)}</span>
                  <strong>{currency(claim.payoutAmount)}</strong>
                  <small>
                    {claim.status === "paid"
                      ? `${claim.payout.gatewayLabel} settled instantly`
                      : `Held for ${titleCase(claim.fraudAssessment.status)}`}
                  </small>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
