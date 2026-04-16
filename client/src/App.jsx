import { useEffect, useState } from "react";
import { api } from "./api.js";
import AuthPanel from "./components/AuthPanel.jsx";
import AdminConsole from "./components/AdminConsole.jsx";
import ClaimsBoard from "./components/ClaimsBoard.jsx";
import LiveSignals from "./components/LiveSignals.jsx";
import OverviewPanel from "./components/OverviewPanel.jsx";
import PolicyStudio from "./components/PolicyStudio.jsx";
import ScenarioLab from "./components/ScenarioLab.jsx";
import SubmissionKit from "./components/SubmissionKit.jsx";
import { currency, percent, titleCase } from "./formatters.js";

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
  preferredPayoutRail: "upi",
};

const defaultPolicyForm = {
  coverageAmount: 5000,
  coverageHours: 48,
  payoutGatewayId: "upi",
};

const defaultSimulationForm = {
  fraudPresetId: "clean",
  gatewayId: "upi",
};

const defaultGatewayOptions = [
  { id: "upi", label: "UPI Simulator" },
  { id: "razorpay", label: "Razorpay Test Mode" },
  { id: "stripe", label: "Stripe Sandbox" },
];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(sessionTokenKey));
  const [authMode, setAuthMode] = useState("register");
  const [authForm, setAuthForm] = useState(defaultAuthForm);
  const [policyForm, setPolicyForm] = useState(defaultPolicyForm);
  const [simulationForm, setSimulationForm] = useState(defaultSimulationForm);
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

      if (overview.view === "worker") {
        setQuote(overview.quotePreview);
        setPolicyForm({
          coverageAmount: overview.quotePreview.coverageAmount,
          coverageHours: overview.quotePreview.coverageHours,
          payoutGatewayId:
            overview.workerIntelligence.activePolicy?.payoutGatewayId ||
            overview.user.preferredPayoutRail ||
            "upi",
        });
        setSimulationForm((current) => ({
          ...current,
          gatewayId:
            overview.workerIntelligence.activePolicy?.payoutGatewayId ||
            overview.user.preferredPayoutRail ||
            "upi",
        }));
      } else {
        setQuote(null);
      }
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
      [name]: name === "weeklyIncome" ? Number(value) : value,
    }));
  }

  function onPolicyFieldChange(event) {
    const { name, value } = event.target;
    setPolicyForm((current) => ({
      ...current,
      [name]:
        name === "coverageAmount" || name === "coverageHours" ? Number(value) : value,
    }));
  }

  function onSimulationFieldChange(event) {
    const { name, value } = event.target;
    setSimulationForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleRegister() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.register(authForm);
      persistSession(response.token);
      setMessage("Worker registered successfully. Suraksha coverage is ready.");
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

  async function handleDemo(persona = "worker") {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.bootstrapDemo(persona);
      persistSession(response.token);
      setDashboard(response.overview);
      setAuthMode("login");
      setAuthForm((current) => ({
        ...current,
        email: response.credentials.email,
        password: response.credentials.password,
      }));

      if (response.overview.view === "worker") {
        setQuote(response.overview.quotePreview);
        setPolicyForm({
          coverageAmount: response.overview.quotePreview.coverageAmount,
          coverageHours: response.overview.quotePreview.coverageHours,
          payoutGatewayId:
            response.overview.workerIntelligence.activePolicy?.payoutGatewayId ||
            response.overview.user.preferredPayoutRail ||
            "upi",
        });
        setSimulationForm((current) => ({
          ...current,
          gatewayId:
            response.overview.workerIntelligence.activePolicy?.payoutGatewayId ||
            response.overview.user.preferredPayoutRail ||
            "upi",
        }));
      } else {
        setQuote(null);
      }

      setMessage(
        persona === "admin"
          ? "Admin portfolio console loaded."
          : "Worker demo loaded. Trigger a disruption to show automated claims and payout.",
      );
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
      setMessage("Premium recalculated using the live disruption snapshot.");
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
      setMessage("Weekly protection activated and payout rail linked.");
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
      const response = await api.simulateTriggers(token, {
        scenarioId,
        fraudPresetId: simulationForm.fraudPresetId,
        gatewayId: simulationForm.gatewayId,
      });
      setScenarioResult(response);
      await refreshOverview(token);
      setMessage(
        response.claims.length
          ? "Scenario processed. Claim review and payout simulation completed."
          : "Scenario ran successfully. Thresholds were not crossed this time.",
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
      await api.updatePolicy(token, policy._id, {
        status,
        payoutGatewayId: policyForm.payoutGatewayId,
      });
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
      setMessage("Claim cleared and instant payout simulated.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const gatewayOptions = dashboard?.gatewayOptions || defaultGatewayOptions;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">
            <img src="/logo/icon.png" alt="Suraksha Logo" width="64" height="64" />
          </span>
          <div>
            <strong>Suraksha</strong>
            <span>Parametric protection for delivery workers</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={() => handleDemo("worker")}>
            Worker Demo
          </button>
          <button className="ghost-button" type="button" onClick={() => handleDemo("admin")}>
            Admin Demo
          </button>
          {dashboard ? (
            <button className="secondary-button" type="button" onClick={clearSession}>
              Logout
            </button>
          ) : null}
        </div>
      </header>

      <section className="hero-stage">
        <div className="hero-copy">
          <span className="section-kicker">Guidewire DEVTrails 2026</span>
          <h1>Income protection designed around the rhythm of a delivery shift.</h1>
          <p>
            Suraksha blends parametric triggers, ML-driven fraud detection, and
            simulated instant payouts so gig workers recover lost wages without
            paperwork or waiting.
          </p>
          <div className="hero-strip">
            <article>
              <strong>Advanced fraud</strong>
              <span>GPS spoofing and fake weather claims checked against telemetry and history.</span>
            </article>
            <article>
              <strong>Instant payouts</strong>
              <span>UPI, Razorpay, and Stripe sandbox flows simulate wage replacement.</span>
            </article>
            <article>
              <strong>Dual dashboards</strong>
              <span>Worker protection view plus insurer loss ratio and forecast console.</span>
            </article>
          </div>
        </div>

        <div className="hero-panel panel-surface">
          {dashboard ? (
            <>
              <span className="section-kicker">
                {dashboard.view === "admin" ? "Insurer view" : "Worker view"}
              </span>
              <h3>{dashboard.user.fullName}</h3>
              <p>
                {dashboard.view === "admin"
                  ? "Track live portfolio metrics, claim forecasts, and pricing viability."
                  : `Coverage status: ${dashboard.metrics.protectionStatus}. Weekly premium is ${currency(dashboard.metrics.weeklyPremium || 0)}.`}
              </p>

              <div className="hero-metrics">
                {dashboard.view === "admin" ? (
                  <>
                    <article>
                      <strong>{dashboard.adminConsole.kpis.activePolicies}</strong>
                      <span>Active policies</span>
                    </article>
                    <article>
                      <strong>{percent(dashboard.adminConsole.kpis.predictiveLossRatio)}</strong>
                      <span>Predictive loss ratio</span>
                    </article>
                    <article>
                      <strong>{dashboard.adminConsole.kpis.nextWeekExpectedClaims}</strong>
                      <span>Expected claims</span>
                    </article>
                  </>
                ) : (
                  <>
                    <article>
                      <strong>{currency(dashboard.metrics.earningsProtected)}</strong>
                      <span>Protected earnings</span>
                    </article>
                    <article>
                      <strong>{dashboard.metrics.activePolicies}</strong>
                      <span>Active weekly cover</span>
                    </article>
                    <article>
                      <strong>{percent(dashboard.workerIntelligence.forecast.forecastConfidence)}</strong>
                      <span>Forecast confidence</span>
                    </article>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="section-kicker">Submission-ready build</span>
              <h3>What the judges can verify live</h3>
              <ul className="hero-list">
                <li>Dynamic weekly policy pricing linked to disruption exposure</li>
                <li>ML anomaly scoring instead of purely rule-based fraud logic</li>
                <li>Instant payout simulation after automated claim approval</li>
                <li>Worker and insurer dashboards with business viability signals</li>
              </ul>
            </>
          )}
        </div>
      </section>

      {message ? <p className="status-text banner">{message}</p> : null}

      {!dashboard ? (
        <>
          <AuthPanel
            authForm={authForm}
            authMode={authMode}
            loading={loading}
            message={message}
            onDemoAdmin={() => handleDemo("admin")}
            onDemoWorker={() => handleDemo("worker")}
            onFieldChange={onAuthFieldChange}
            onLogin={handleLogin}
            onModeChange={setAuthMode}
            onRegister={handleRegister}
          />
          <SubmissionKit />
        </>
      ) : dashboard.view === "worker" ? (
        <>
          <div className="dashboard-grid">
            <OverviewPanel
              dashboard={dashboard}
              onPolicyStatusChange={updatePolicyStatus}
            />
            <PolicyStudio
              gatewayOptions={gatewayOptions}
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
            fraudPresets={dashboard.fraudPresets}
            gatewayOptions={gatewayOptions}
            loading={loading}
            onFieldChange={onSimulationFieldChange}
            onSimulate={simulateScenario}
            scenarioResult={scenarioResult}
            scenarios={dashboard.scenarios}
            simulationForm={simulationForm}
          />
          <ClaimsBoard
            claims={dashboard.claims}
            loading={loading}
            onReleaseClaim={releaseClaim}
          />
          <SubmissionKit />
        </>
      ) : (
        <>
          <AdminConsole dashboard={dashboard} />
          <SubmissionKit />
        </>
      )}
    </div>
  );
}
