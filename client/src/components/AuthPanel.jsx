const cityOptions = ["Bengaluru", "Mumbai", "Chennai", "Delhi", "Hyderabad"];
const zoneOptions = [
  { value: "safe", label: "Safe Zone" },
  { value: "moderate", label: "Moderate Zone" },
  { value: "high-risk", label: "High-Risk Zone" },
];
const payoutRails = [
  { value: "upi", label: "UPI Simulator" },
  { value: "razorpay", label: "Razorpay Test Mode" },
  { value: "stripe", label: "Stripe Sandbox" },
];

export default function AuthPanel({
  authMode,
  authForm,
  loading,
  message,
  onFieldChange,
  onModeChange,
  onRegister,
  onLogin,
  onDemoWorker,
  onDemoAdmin,
}) {
  return (
    <section className="auth-showcase">
      <div className="auth-story panel-surface">
        <span className="section-kicker">Perfect for Your Worker</span>
        <h2>Weekly protection that feels native to delivery work.</h2>
        <p>
          Suraksha covers disrupted income, verifies fraud with telemetry plus
          historical weather signals, and simulates instant wage replacement
          through trusted payout rails.
        </p>
        <div className="story-points">
          <article>
            <strong>5-minute flow</strong>
            <span>Onboard a rider, issue weekly cover, simulate rain, and settle pay.</span>
          </article>
          <article>
            <strong>Fraud-aware</strong>
            <span>GPS spoofing and fake weather claims are held before they can leak money.</span>
          </article>
          <article>
            <strong>Admin-ready</strong>
            <span>Loss ratios, portfolio forecasts, and viability metrics sit in one console.</span>
          </article>
        </div>
        <div className="demo-badges">
          <span>Worker demo</span>
          <span>Admin demo</span>
          <span>Mock payouts</span>
        </div>
      </div>

      <div className="auth-panel panel-surface">
        <div className="panel-heading">
          <span className="section-kicker">Access Suraksha</span>
          <h3>Launch the live demo stack</h3>
          <p>Register a worker, or jump straight into a seeded worker/admin journey.</p>
        </div>

        <div className="auth-switch">
          <button
            className={authMode === "register" ? "active" : ""}
            type="button"
            onClick={() => onModeChange("register")}
          >
            Register Worker
          </button>
          <button
            className={authMode === "login" ? "active" : ""}
            type="button"
            onClick={() => onModeChange("login")}
          >
            Login
          </button>
        </div>

        <form
          className="grid-form auth-grid"
          onSubmit={(event) => {
            event.preventDefault();
            if (authMode === "register") {
              onRegister();
              return;
            }

            onLogin();
          }}
        >
          {authMode === "register" ? (
            <>
              <label>
                Full name
                <input
                  name="fullName"
                  onChange={onFieldChange}
                  placeholder="Aarav Singh"
                  value={authForm.fullName}
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  onChange={onFieldChange}
                  placeholder="worker@example.com"
                  type="email"
                  value={authForm.email}
                />
              </label>
              <label>
                Phone
                <input
                  name="phone"
                  onChange={onFieldChange}
                  placeholder="9876543210"
                  value={authForm.phone}
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  onChange={onFieldChange}
                  placeholder="Create a password"
                  type="password"
                  value={authForm.password}
                />
              </label>
              <label>
                City
                <select name="city" onChange={onFieldChange} value={authForm.city}>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Zone type
                <select
                  name="zoneType"
                  onChange={onFieldChange}
                  value={authForm.zoneType}
                >
                  {zoneOptions.map((zone) => (
                    <option key={zone.value} value={zone.value}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Occupation
                <input
                  name="occupation"
                  onChange={onFieldChange}
                  placeholder="Delivery Rider"
                  value={authForm.occupation}
                />
              </label>
              <label>
                Platform
                <input
                  name="platform"
                  onChange={onFieldChange}
                  placeholder="Swiggy / Zomato / Zepto"
                  value={authForm.platform}
                />
              </label>
              <label>
                Weekly income
                <input
                  min="1000"
                  name="weeklyIncome"
                  onChange={onFieldChange}
                  type="number"
                  value={authForm.weeklyIncome}
                />
              </label>
              <label>
                Preferred payout rail
                <select
                  name="preferredPayoutRail"
                  onChange={onFieldChange}
                  value={authForm.preferredPayoutRail}
                >
                  {payoutRails.map((rail) => (
                    <option key={rail.value} value={rail.value}>
                      {rail.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full-span">
                UPI ID
                <input
                  name="upiId"
                  onChange={onFieldChange}
                  placeholder="worker@upi"
                  value={authForm.upiId}
                />
              </label>
            </>
          ) : (
            <>
              <label className="full-span">
                Email
                <input
                  name="email"
                  onChange={onFieldChange}
                  placeholder="worker@example.com"
                  type="email"
                  value={authForm.email}
                />
              </label>
              <label className="full-span">
                Password
                <input
                  name="password"
                  onChange={onFieldChange}
                  placeholder="Enter your password"
                  type="password"
                  value={authForm.password}
                />
              </label>
            </>
          )}

          <div className="form-actions full-span">
            <button className="primary-button" disabled={loading} type="submit">
              {loading
                ? "Working..."
                : authMode === "register"
                  ? "Create Protected Worker"
                  : "Login to Dashboard"}
            </button>
            <button
              className="secondary-button"
              disabled={loading}
              type="button"
              onClick={onDemoWorker}
            >
              Load Worker Demo
            </button>
            <button
              className="ghost-button"
              disabled={loading}
              type="button"
              onClick={onDemoAdmin}
            >
              Load Admin Demo
            </button>
          </div>
        </form>

        {message ? <p className="status-text">{message}</p> : null}
      </div>
    </section>
  );
}
