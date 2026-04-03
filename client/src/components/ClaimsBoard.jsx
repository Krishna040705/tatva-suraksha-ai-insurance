function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function ClaimsBoard({ claims, loading, onReleaseClaim }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <span className="eyebrow">Claims Management</span>
        <h2>Zero-touch claim rail</h2>
        <p>
          Claims are initiated automatically. Suspicious cases are flagged for
          review instead of being rejected outright.
        </p>
      </div>

      <div className="claim-list">
        {claims.length ? (
          claims.map((claim) => (
            <article className="claim-card" key={claim._id}>
              <div className="claim-header">
                <div>
                  <h3>{claim.triggerType.replaceAll("_", " ")}</h3>
                  <p>{claim.explanation}</p>
                </div>
                <span className={`claim-status ${claim.status}`}>
                  {claim.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="claim-meta">
                <span>Payout: {currency(claim.payoutAmount)}</span>
                <span>Loss hours: {claim.lossHours}</span>
                <span>Ref: {claim.payoutReference}</span>
              </div>

              <div className="claim-meta">
                <span>Fraud score: {claim.fraudAssessment.score}</span>
                <span>{claim.fraudAssessment.status}</span>
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
            <h3>No claims yet</h3>
            <p>Run a disruption scenario to watch automated claims appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
