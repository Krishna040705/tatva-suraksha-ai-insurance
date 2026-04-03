const cityOptions = ["Bengaluru", "Mumbai", "Chennai", "Delhi", "Hyderabad"];
const zoneOptions = [
  { value: "safe", label: "Safe Zone" },
  { value: "moderate", label: "Moderate Zone" },
  { value: "high-risk", label: "High-Risk Zone" },
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
  onDemo,
}) {
  return (
    <section className="panel auth-panel">
      <div className="section-heading">
        <span className="eyebrow">Worker Onboarding</span>
        <h2>Registration and access for weekly protection</h2>
        <p>
          Register a gig worker profile, calculate hyper-local premium pricing,
          and issue coverage in one flow.
        </p>
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
        className="grid-form"
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
                value={authForm.fullName}
                onChange={onFieldChange}
                placeholder="Aarav Singh"
              />
            </label>
            <label>
              Email
              <input
                name="email"
                value={authForm.email}
                onChange={onFieldChange}
                placeholder="worker@example.com"
                type="email"
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                value={authForm.phone}
                onChange={onFieldChange}
                placeholder="9876543210"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                value={authForm.password}
                onChange={onFieldChange}
                placeholder="Create a password"
                type="password"
              />
            </label>
            <label>
              City
              <select name="city" value={authForm.city} onChange={onFieldChange}>
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
                value={authForm.zoneType}
                onChange={onFieldChange}
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
                value={authForm.occupation}
                onChange={onFieldChange}
                placeholder="Delivery Rider"
              />
            </label>
            <label>
              Platform
              <input
                name="platform"
                value={authForm.platform}
                onChange={onFieldChange}
                placeholder="Swiggy / Zomato / Rapido"
              />
            </label>
            <label>
              Weekly income
              <input
                name="weeklyIncome"
                value={authForm.weeklyIncome}
                onChange={onFieldChange}
                min="1000"
                type="number"
              />
            </label>
            <label>
              UPI ID
              <input
                name="upiId"
                value={authForm.upiId}
                onChange={onFieldChange}
                placeholder="worker@upi"
              />
            </label>
          </>
        ) : (
          <>
            <label>
              Email
              <input
                name="email"
                value={authForm.email}
                onChange={onFieldChange}
                placeholder="worker@example.com"
                type="email"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                value={authForm.password}
                onChange={onFieldChange}
                placeholder="Enter your password"
                type="password"
              />
            </label>
          </>
        )}

        <div className="form-actions full-span">
          <button className="primary-button" disabled={loading} type="submit">
            {loading
              ? "Working..."
              : authMode === "register"
                ? "Create Protected Profile"
                : "Login to Dashboard"}
          </button>
          <button
            className="secondary-button"
            disabled={loading}
            type="button"
            onClick={onDemo}
          >
            Load Demo Account
          </button>
        </div>
      </form>

      {message ? <p className="status-text">{message}</p> : null}
    </section>
  );
}
