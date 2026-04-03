function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function PolicyStudio({
  policyForm,
  quote,
  loading,
  onFieldChange,
  onRefreshQuote,
  onCreatePolicy,
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <span className="eyebrow">Insurance Policy Management</span>
        <h2>Dynamic premium calculator</h2>
        <p>
          Weekly premiums move with disruption signals, zone history, and trust
          behavior.
        </p>
      </div>

      <div className="grid-form compact">
        <label>
          Coverage amount
          <input
            min="3000"
            name="coverageAmount"
            onChange={onFieldChange}
            type="number"
            value={policyForm.coverageAmount}
          />
        </label>
        <label>
          Coverage hours
          <input
            min="20"
            name="coverageHours"
            onChange={onFieldChange}
            type="number"
            value={policyForm.coverageHours}
          />
        </label>
      </div>

      {quote ? (
        <div className="quote-panel">
          <div className="quote-hero">
            <div>
              <span className="eyebrow">Recommended Premium</span>
              <h3>{currency(quote.dynamicPremium)} / week</h3>
            </div>
            <div className="quote-badge">
              <span>Risk score</span>
              <strong>{quote.riskScore}</strong>
            </div>
          </div>

          <div className="metric-grid two-columns">
            <article className="metric-card">
              <span>Base premium</span>
              <strong>{currency(quote.basePremium)}</strong>
              <small>Baseline based on coverage amount.</small>
            </article>
            <article className="metric-card">
              <span>Risk band</span>
              <strong>{quote.riskBand}</strong>
              <small>Updated by real-time operating conditions.</small>
            </article>
          </div>

          <div className="factor-list">
            {quote.factors.map((factor) => (
              <p key={factor}>{factor}</p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="form-actions">
        <button
          className="secondary-button"
          disabled={loading}
          type="button"
          onClick={onRefreshQuote}
        >
          Refresh Quote
        </button>
        <button
          className="primary-button"
          disabled={loading || !quote}
          type="button"
          onClick={onCreatePolicy}
        >
          Activate Policy
        </button>
      </div>
    </section>
  );
}
