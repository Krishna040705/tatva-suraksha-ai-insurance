import { currency, shortDate, titleCase } from "../formatters.js";

export default function PolicyStudio({
  policyForm,
  quote,
  loading,
  gatewayOptions,
  onFieldChange,
  onRefreshQuote,
  onCreatePolicy,
}) {
  return (
    <section className="panel-surface">
      <div className="panel-heading">
        <span className="section-kicker">Income Shield Studio</span>
        <h3>Weekly pricing built for gig-worker cash flow</h3>
        <p>
          Adjust coverage, choose the payout rail, and see how the pricing
          model reacts to live disruption risk in real time.
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
        <label className="full-span">
          Instant payout rail
          <select
            name="payoutGatewayId"
            onChange={onFieldChange}
            value={policyForm.payoutGatewayId}
          >
            {gatewayOptions.map((gateway) => (
              <option key={gateway.id} value={gateway.id}>
                {gateway.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {quote ? (
        <div className="quote-showcase">
          <div className="quote-main">
            <span className="section-kicker">Recommended premium</span>
            <h4>{currency(quote.dynamicPremium)} / week</h4>
            <p>
              Coverage remains active until {shortDate(quote.nextBillingDate)} and
              is tuned to a {titleCase(quote.riskBand)} risk worker profile.
            </p>
          </div>

          <div className="metric-grid three-up">
            <article className="metric-tile">
              <span>Base premium</span>
              <strong>{currency(quote.basePremium)}</strong>
              <small>Coverage amount sets the baseline.</small>
            </article>
            <article className="metric-tile">
              <span>Risk score</span>
              <strong>{quote.riskScore}</strong>
              <small>Live exposure signal for pricing.</small>
            </article>
            <article className="metric-tile">
              <span>Payout readiness</span>
              <strong>{titleCase(policyForm.payoutGatewayId)}</strong>
              <small>Simulated instant settlement on approval.</small>
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
          Activate Weekly Cover
        </button>
      </div>
    </section>
  );
}
