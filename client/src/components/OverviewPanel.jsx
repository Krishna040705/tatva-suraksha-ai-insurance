function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function OverviewPanel({ dashboard, onPolicyStatusChange }) {
  const primaryPolicy =
    dashboard.policies.find((policy) => policy.status === "active") ||
    dashboard.policies[0];

  return (
    <section className="panel">
      <div className="section-heading">
        <span className="eyebrow">Protection Overview</span>
        <h2>{dashboard.user.fullName}</h2>
        <p>
          {dashboard.user.occupation} on {dashboard.user.platform} in{" "}
          {dashboard.user.city}. Trust score is {dashboard.user.trustScore}/100.
        </p>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Weekly Income</span>
          <strong>{currency(dashboard.user.weeklyIncome)}</strong>
          <small>Income baseline used for payout simulation.</small>
        </article>
        <article className="metric-card">
          <span>Protection Status</span>
          <strong>{dashboard.metrics.protectionStatus}</strong>
          <small>{dashboard.metrics.activePolicies} active policy in force.</small>
        </article>
        <article className="metric-card">
          <span>Total Payouts</span>
          <strong>{currency(dashboard.metrics.totalPayouts)}</strong>
          <small>Zero-touch payouts already settled.</small>
        </article>
      </div>

      {primaryPolicy ? (
        <div className="subpanel">
          <div className="subpanel-row">
            <div>
              <h3>{primaryPolicy.planName}</h3>
              <p>
                Premium {currency(primaryPolicy.dynamicPremium)} / week with{" "}
                {currency(primaryPolicy.coverageAmount)} coverage.
              </p>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                onPolicyStatusChange(
                  primaryPolicy,
                  primaryPolicy.status === "active" ? "paused" : "active",
                )
              }
            >
              {primaryPolicy.status === "active" ? "Pause Policy" : "Reactivate"}
            </button>
          </div>
          <div className="chip-row">
            <span className="chip">Risk band: {primaryPolicy.riskBand}</span>
            <span className="chip">
              Coverage hours: {primaryPolicy.coverageHours} / week
            </span>
            <span className="chip">
              Status: {primaryPolicy.status}
            </span>
            <span className="chip">
              Renewal: {new Date(primaryPolicy.nextBillingDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      ) : (
        <div className="subpanel empty-state">
          <h3>No active policy</h3>
          <p>Create a weekly plan below to activate automated income protection.</p>
        </div>
      )}
    </section>
  );
}
