import { currency, shortDateTime, titleCase } from "../formatters.js";

export default function ClaimsBoard({ claims, loading, onReleaseClaim }) {
  return (
    <section className="panel-surface">
      <div className="panel-heading">
        <span className="section-kicker">Instant payout rail</span>
        <h3>Automated claims with payout and fraud evidence</h3>
        <p>
          Every claim shows the parametric trigger, ML fraud assessment, and the
          exact simulated settlement rail used to replace lost wages.
        </p>
      </div>

      <div className="claim-list">
        {claims.length ? (
          claims.map((claim) => (
            <article className="claim-card" key={claim._id}>
              <div className="claim-topline">
                <div>
                  <span className="section-kicker">{titleCase(claim.triggerType)}</span>
                  <h4>{currency(claim.payoutAmount)} wage replacement</h4>
                  <p>{claim.explanation}</p>
                </div>
                <span className={`claim-status ${claim.status}`}>
                  {titleCase(claim.status)}
                </span>
              </div>

              <div className="claim-grid">
                <div>
                  <span>Payout rail</span>
                  <strong>{claim.payout ? claim.payout.gatewayLabel : titleCase(claim.requestedGatewayId)}</strong>
                  <small>
                    {claim.payout
                      ? `${claim.payout.transferId} • settled in ${claim.payout.settlementMinutes} min`
                      : "Awaiting manual review"}
                  </small>
                </div>
                <div>
                  <span>Fraud assessment</span>
                  <strong>{claim.fraudAssessment.score}/100</strong>
                  <small>
                    {claim.fraudAssessment.modelVersion} • confidence {Math.round((claim.fraudAssessment.confidence || 0) * 100)}%
                  </small>
                </div>
                <div>
                  <span>Covered loss</span>
                  <strong>{claim.lossHours} hours</strong>
                  <small>{shortDateTime(claim.paidAt || claim.createdAt)}</small>
                </div>
              </div>

              <div className="reason-list">
                {claim.fraudAssessment.reasons.map((reason) => (
                  <p key={reason}>{reason}</p>
                ))}
              </div>

              {claim.status === "flagged" ? (
                <button
                  className="secondary-button"
                  disabled={loading}
                  type="button"
                  onClick={() => onReleaseClaim(claim._id)}
                >
                  Release After Review
                </button>
              ) : null}
            </article>
          ))
        ) : (
          <div className="empty-state">
            <h4>No claims yet</h4>
            <p>Run a disruption scenario to populate automated claims and payouts.</p>
          </div>
        )}
      </div>
    </section>
  );
}
