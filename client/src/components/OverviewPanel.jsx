import { currency, percent, shortDate, titleCase } from "../formatters.js";

export default function OverviewPanel({ dashboard, onPolicyStatusChange }) {
  const { user, metrics, workerIntelligence } = dashboard;
  const activePolicy = workerIntelligence.activePolicy;
  const forecast = workerIntelligence.forecast;
  const latestAssessment = workerIntelligence.fraudCenter.latestAssessment;

  return (
    <section className="panel-surface overview-panel">
      <div className="panel-heading">
        <span className="section-kicker">Worker dashboard</span>
        <h3>{user.fullName}</h3>
        <p>
          {user.occupation} on {user.platform} in {user.city}. Suraksha is currently
          protecting weekly earnings with explainable fraud checks and instant
          payout rails.
        </p>
      </div>

      <div className="metric-grid four-up">
        <article className="metric-tile emphasis">
          <span>Earnings protected</span>
          <strong>{currency(metrics.earningsProtected)}</strong>
          <small>Predicted recoverable income next week.</small>
        </article>
        <article className="metric-tile">
          <span>Active weekly cover</span>
          <strong>{activePolicy ? currency(activePolicy.coverageAmount) : "Not active"}</strong>
          <small>{activePolicy ? `${activePolicy.coverageHours} hours insured` : "Activate a policy below"}</small>
        </article>
        <article className="metric-tile">
          <span>Instant payout success</span>
          <strong>{percent(workerIntelligence.fraudCenter.safeAutomationRate)}</strong>
          <small>Claims that flowed through automation without a hold.</small>
        </article>
        <article className="metric-tile">
          <span>Trust score</span>
          <strong>{workerIntelligence.fraudCenter.trustScore}/100</strong>
          <small>Updated by telemetry quality and claim behavior.</small>
        </article>
      </div>

      <div className="split-row">
        <div className="story-card warm">
          <span className="section-kicker">Next week outlook</span>
          <h4>{forecast.topRisk.label} is the highest predicted disruption.</h4>
          <p>
            Model confidence is {percent(forecast.forecastConfidence)} and the likely
            protected income is {currency(forecast.expectedProtectedIncome)} if
            disruptions hit.
          </p>
          <div className="tag-row">
            <span className="info-pill">{forecast.topRisk.likelihoodLabel} likelihood</span>
            <span className="info-pill">{Math.round(forecast.topRisk.probability * 100)}% trigger probability</span>
          </div>
        </div>

        <div className="story-card">
          <span className="section-kicker">Fraud watch</span>
          <h4>{latestAssessment ? `${latestAssessment.modelVersion} is live` : "No anomalies yet"}</h4>
          <p>
            {latestAssessment
              ? latestAssessment.reasons[0]
              : "The ML anomaly engine has not flagged this worker in the current protection window."}
          </p>
          {latestAssessment ? (
            <div className="tag-row">
              <span className="info-pill">Score {latestAssessment.score}</span>
              <span className="info-pill">{titleCase(latestAssessment.status)}</span>
            </div>
          ) : null}
        </div>
      </div>

      {activePolicy ? (
        <div className="detail-panel">
          <div className="detail-heading">
            <div>
              <span className="section-kicker">Policy in force</span>
              <h4>{activePolicy.planName}</h4>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                onPolicyStatusChange(
                  activePolicy,
                  activePolicy.status === "active" ? "paused" : "active",
                )
              }
            >
              {activePolicy.status === "active" ? "Pause Policy" : "Reactivate Policy"}
            </button>
          </div>
          <div className="tag-row">
            <span className="info-pill">Risk band: {titleCase(activePolicy.riskBand)}</span>
            <span className="info-pill">Premium: {currency(activePolicy.dynamicPremium)}/week</span>
            <span className="info-pill">Payout rail: {titleCase(activePolicy.payoutGatewayId)}</span>
            <span className="info-pill">Renewal: {shortDate(activePolicy.nextBillingDate)}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
