import { currency, percent, titleCase } from "../formatters.js";

export default function AdminConsole({ dashboard }) {
  const { adminConsole } = dashboard;
  const { kpis, likelyTriggers, cityRiskTable, portfolioRows, businessMetrics } =
    adminConsole;

  return (
    <>
      <section className="panel-surface">
        <div className="panel-heading">
          <span className="section-kicker">Insurer console</span>
          <h3>Portfolio control for disruption-linked protection</h3>
          <p>
            Live loss ratio, next-week claim prediction, and worker-level trust
            signals are visible in one operating view for the insurer team.
          </p>
        </div>

        <div className="metric-grid four-up">
          <article className="metric-tile emphasis">
            <span>Weekly premium pool</span>
            <strong>{currency(kpis.weeklyPremiumPool)}</strong>
            <small>Current in-force premium base.</small>
          </article>
          <article className="metric-tile">
            <span>Live loss ratio</span>
            <strong>{percent(kpis.liveLossRatio)}</strong>
            <small>Settled payouts divided by weekly premium pool.</small>
          </article>
          <article className="metric-tile">
            <span>Predictive loss ratio</span>
            <strong>{percent(kpis.predictiveLossRatio)}</strong>
            <small>Expected next-week ratio from the forecast model.</small>
          </article>
          <article className="metric-tile">
            <span>Expected claims next week</span>
            <strong>{kpis.nextWeekExpectedClaims}</strong>
            <small>Portfolio-wide forecast from active policies.</small>
          </article>
        </div>
      </section>

      <section className="admin-grid">
        <div className="panel-surface">
          <div className="panel-heading">
            <span className="section-kicker">Likely triggers</span>
            <h3>Next-week disruption forecast</h3>
          </div>
          <div className="stack-list">
            {likelyTriggers.map((trigger) => (
              <article className="stack-item" key={trigger.triggerType}>
                <div>
                  <strong>{trigger.label}</strong>
                  <small>{Math.round(trigger.expectedClaims * 10) / 10} likely claims</small>
                </div>
                <span>{Math.round(trigger.probability * 100)}%</span>
              </article>
            ))}
          </div>
        </div>

        <div className="panel-surface">
          <div className="panel-heading">
            <span className="section-kicker">City risk spread</span>
            <h3>Where payout pressure is building</h3>
          </div>
          <div className="stack-list">
            {cityRiskTable.map((city) => (
              <article className="stack-item" key={city.city}>
                <div>
                  <strong>{city.city}</strong>
                  <small>{city.workersCovered} workers covered</small>
                </div>
                <span>{currency(city.expectedPayouts)}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel-surface">
        <div className="panel-heading">
          <span className="section-kicker">Portfolio rows</span>
          <h3>Worker-level pricing and payout view</h3>
        </div>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>City</th>
                <th>Platform</th>
                <th>Risk band</th>
                <th>Premium</th>
                <th>Payouts</th>
                <th>Trust</th>
              </tr>
            </thead>
            <tbody>
              {portfolioRows.map((row) => (
                <tr key={row.workerId}>
                  <td>{row.fullName}</td>
                  <td>{row.city}</td>
                  <td>{row.platform}</td>
                  <td>{titleCase(row.riskBand)}</td>
                  <td>{currency(row.premium)}</td>
                  <td>{currency(row.payouts)}</td>
                  <td>{row.trustScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-grid">
        <div className="panel-surface">
          <div className="panel-heading">
            <span className="section-kicker">Business viability</span>
            <h3>Why weekly pricing can sustain the portfolio</h3>
          </div>
          <div className="stack-list">
            <article className="stack-item">
              <div>
                <strong>Premium adequacy</strong>
                <small>Remaining headroom after payouts this cycle</small>
              </div>
              <span>{percent(businessMetrics.premiumAdequacy)}</span>
            </article>
            <article className="stack-item">
              <div>
                <strong>Break-even scale</strong>
                <small>Projected worker count for stable operations</small>
              </div>
              <span>{businessMetrics.breakEvenWorkers} workers</span>
            </article>
            <article className="stack-item">
              <div>
                <strong>No-paperwork rate</strong>
                <small>Claims handled without traditional documentation loops</small>
              </div>
              <span>{percent(businessMetrics.socialImpact.noPaperworkRate)}</span>
            </article>
          </div>
        </div>

        <div className="panel-surface">
          <div className="panel-heading">
            <span className="section-kicker">Social impact</span>
            <h3>Adoption factors for real gig workers</h3>
          </div>
          <div className="stack-list">
            <article className="stack-item">
              <div>
                <strong>Low-balance workers covered</strong>
                <small>Workers earning Rs 8k/week or less in the insured base</small>
              </div>
              <span>{businessMetrics.socialImpact.lowBalanceWorkersProtected}</span>
            </article>
            <article className="stack-item">
              <div>
                <strong>Women-friendly coverage score</strong>
                <small>Proxy score for safer, predictable income continuity</small>
              </div>
              <span>{businessMetrics.socialImpact.womenFriendlyCoverageScore}/100</span>
            </article>
            <article className="stack-item">
              <div>
                <strong>Workers protected</strong>
                <small>Current active protection count in the portfolio</small>
              </div>
              <span>{businessMetrics.socialImpact.workersCovered}</span>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
