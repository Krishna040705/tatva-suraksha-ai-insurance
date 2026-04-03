import { useEffect, useState } from "react";
import { api } from "./api.js";
import AuthPanel from "./components/AuthPanel.jsx";
import ClaimsBoard from "./components/ClaimsBoard.jsx";
import LiveSignals from "./components/LiveSignals.jsx";
import OverviewPanel from "./components/OverviewPanel.jsx";
import PolicyStudio from "./components/PolicyStudio.jsx";
import ScenarioLab from "./components/ScenarioLab.jsx";

const sessionTokenKey = "suraksha-token";

const defaultAuthForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  city: "Bengaluru",
  zoneType: "moderate",
  occupation: "Delivery Rider",
  platform: "Swiggy",
  weeklyIncome: 7000,
  upiId: "",
};

const defaultPolicyForm = {
  coverageAmount: 5000,
  coverageHours: 48,
  scenarioId: "balanced-day",
};

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(sessionTokenKey));
  const [authMode, setAuthMode] = useState("register");
  const [authForm, setAuthForm] = useState(defaultAuthForm);
  const [policyForm, setPolicyForm] = useState(defaultPolicyForm);
  const [dashboard, setDashboard] = useState(null);
  const [quote, setQuote] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    refreshOverview(token);
  }, [token]);

  async function refreshOverview(activeToken = token) {
    try {
      const overview = await api.fetchOverview(activeToken);
      setDashboard(overview);
      setQuote(overview.quotePreview);
      setPolicyForm({
        coverageAmount: overview.quotePreview.coverageAmount,
        coverageHours: overview.quotePreview.coverageHours,
        scenarioId: "balanced-day",
      });
    } catch (error) {
      setMessage(error.message);
      clearSession();
    }
  }

  function persistSession(sessionToken) {
    localStorage.setItem(sessionTokenKey, sessionToken);
    setToken(sessionToken);
  }

  function clearSession() {
    localStorage.removeItem(sessionTokenKey);
    setToken(null);
    setDashboard(null);
    setQuote(null);
    setScenarioResult(null);
  }

  function onAuthFieldChange(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function onPolicyFieldChange(event) {
    const { name, value } = event.target;
    setPolicyForm((current) => ({
      ...current,
      [name]: Number(value),
    }));
  }

  async function handleRegister() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.register({
        ...authForm,
        weeklyIncome: Number(authForm.weeklyIncome),
      });
      persistSession(response.token);
      setMessage("Worker registered successfully. Protection dashboard is ready.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.login({
        email: authForm.email,
        password: authForm.password,
      });
      persistSession(response.token);
      setMessage("Logged in successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.bootstrapDemo();
      persistSession(response.token);
      setDashboard(response.overview);
      setQuote(response.overview.quotePreview);
      setPolicyForm({
        coverageAmount: response.overview.quotePreview.coverageAmount,
        coverageHours: response.overview.quotePreview.coverageHours,
        scenarioId: "balanced-day",
      });
      setAuthMode("login");
      setAuthForm((current) => ({
        ...current,
        email: response.credentials.email,
        password: response.credentials.password,
      }));
      setMessage("Demo account loaded. Use the scenario lab to trigger payouts.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshQuote() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.fetchQuote(token, policyForm);
      setQuote(response);
      setMessage("Premium recalculated with the latest disruption signals.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createPolicy() {
    setLoading(true);
    setMessage("");

    try {
      await api.createPolicy(token, policyForm);
      await refreshOverview(token);
      setMessage("Policy activated and ready for automated claims.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function simulateScenario(scenarioId) {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.simulateTriggers(token, { scenarioId });
      setScenarioResult(response);
      await refreshOverview(token);
      setMessage(
        response.claims.length
          ? "Disruption processed and claims were created automatically."
          : "Scenario ran successfully. No thresholds were crossed this time.",
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePolicyStatus(policy, status) {
    setLoading(true);
    setMessage("");

    try {
      await api.updatePolicy(token, policy._id, { status });
      await refreshOverview(token);
      setMessage(`Policy status updated to ${status}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function releaseClaim(claimId) {
    setLoading(true);
    setMessage("");

    try {
      await api.releaseClaim(token, claimId);
      await refreshOverview(token);
      setMessage("Flagged claim released after manual review.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="hero-shell">
        <div className="hero-copy">
          <span className="hero-tag">Team Tatva | Guidewire DEVTrails 2026</span>
          <h1>Suraksha protects gig workers before disruption becomes debt.</h1>
          <p>
            AI-powered parametric income protection for riders, drivers, and
            field workers facing monsoon loss, heatwaves, pollution spikes, and
            curfew shutdowns.
          </p>
          <div className="hero-stats">
            <article>
              <strong>5</strong>
              <span>Automated trigger streams</span>
            </article>
            <article>
              <strong>0</strong>
              <span>Manual claim forms for approved payouts</span>
            </article>
            <article>
              <strong>Rs 2</strong>
              <span>Safe-zone weekly discount supported in pricing</span>
            </article>
          </div>
        </div>

        <div className="hero-card">
          <span className="eyebrow">Phase 2 Submission Readiness</span>
          <h2>What this build demonstrates</h2>
          <div className="chip-row">
            <span className="chip">Registration Process</span>
            <span className="chip">Insurance Policy Management</span>
            <span className="chip">Dynamic Premium Calculation</span>
            <span className="chip">Claims Management</span>
          </div>
          <p>
            {dashboard
              ? `${dashboard.user.fullName} is currently covered for ${currency(
                  dashboard.quotePreview.coverageAmount,
                )} with a recommended premium of ${currency(
                  dashboard.quotePreview.dynamicPremium,
                )} per week.`
              : "Start with a fresh worker registration or load the seeded demo account to jump straight into the automated claims journey."}
          </p>
        </div>
      </header>

      {!dashboard ? (
        <AuthPanel
          authForm={authForm}
          authMode={authMode}
          loading={loading}
          message={message}
          onDemo={handleDemo}
          onFieldChange={onAuthFieldChange}
          onLogin={handleLogin}
          onModeChange={setAuthMode}
          onRegister={handleRegister}
        />
      ) : (
        <>
          <div className="toolbar">
            <div>
              <span className="eyebrow">Signed in as</span>
              <h2>{dashboard.user.fullName}</h2>
            </div>
            <div className="toolbar-actions">
              <button className="secondary-button" type="button" onClick={handleDemo}>
                Reload Demo Data
              </button>
              <button className="ghost-button" type="button" onClick={clearSession}>
                Logout
              </button>
            </div>
          </div>

          {message ? <p className="status-text">{message}</p> : null}

          <div className="dashboard-grid">
            <OverviewPanel
              dashboard={dashboard}
              onPolicyStatusChange={updatePolicyStatus}
            />
            <PolicyStudio
              loading={loading}
              onCreatePolicy={createPolicy}
              onFieldChange={onPolicyFieldChange}
              onRefreshQuote={refreshQuote}
              policyForm={policyForm}
              quote={quote}
            />
          </div>

          <LiveSignals snapshot={dashboard.liveSnapshot} />
          <ScenarioLab
            loading={loading}
            onSimulate={simulateScenario}
            scenarioResult={scenarioResult}
            scenarios={dashboard.scenarios}
          />
          <ClaimsBoard
            claims={dashboard.claims}
            loading={loading}
            onReleaseClaim={releaseClaim}
          />
        </>
      )}
    </div>
  );
}
