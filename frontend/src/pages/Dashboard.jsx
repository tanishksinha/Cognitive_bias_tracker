import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

const TIER_META = {
  baseline:    { label: "Baseline",    color: "var(--text-muted)",    desc: "Just getting started" },
  early:       { label: "Early",       color: "var(--amber)",          desc: "Building your profile" },
  established: { label: "Established", color: "var(--teal)",           desc: "High-confidence analysis" },
};

export default function Dashboard() {
  const [decisions, setDecisions] = useState([]);
  const [insights,  setInsights]  = useState(null);
  const [profile,   setProfile]   = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/decisions/").then(r  => setDecisions(r.data)).catch(() => {});
    axios.get("/api/decisions/insights").then(r => setInsights(r.data)).catch(() => {});
    axios.get("/api/profile/me").then(r  => setProfile(r.data)).catch(() => setProfile(null));
  }, []);

  const logout = () => { localStorage.removeItem("token"); navigate("/"); };

  const noProfile = profile !== undefined && (profile === null || profile.profile === null);
  const tier = TIER_META[insights?.confidence_level] || TIER_META.baseline;

  return (
    <>
      {/* ── App nav ─────────────────────────────────── */}
      <nav className="app-nav">
        <div className="brand">
          <span className="brand-dot" />
          BiasTracker
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/settings">
            <button className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>
              Settings
            </button>
          </Link>
          <button onClick={logout} className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>
            Sign out
          </button>
        </div>
      </nav>

      <div className="page-wrapper">

        {/* ── Profile prompt ───────────────────────── */}
        {noProfile && (
          <div className="alert alert-warning fade-up-1" style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 28, gap: 16,
          }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Complete your decision profile</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                A 15-minute assessment sets your personalised bias baseline.
                Without it, analysis uses neutral priors only.
              </div>
            </div>
            <Link to="/questionnaire" style={{ flexShrink: 0 }}>
              <button className="btn-secondary" style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                Start assessment →
              </button>
            </Link>
          </div>
        )}

        {/* ── Stats row ────────────────────────────── */}
        {insights && (
          <div className="stat-row fade-up-2" style={{ marginBottom: 28 }}>
            <div className="stat-chip">
              <div className="value">{insights.total_decisions}</div>
              <div className="label">Decisions logged</div>
            </div>
            <div className="stat-chip">
              <div className="value" style={{ color: tier.color, fontSize: "1.2rem" }}>
                {tier.label}
              </div>
              <div className="label">Confidence tier</div>
            </div>
            <div className="stat-chip">
              <div className="value">{Math.max(0, 15 - (insights.decision_count || 0))}</div>
              <div className="label">Until early tier</div>
            </div>
          </div>
        )}

        {/* ── Decisions list ───────────────────────── */}
        <div className="section-header fade-up-3">
          <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Your decisions</h2>
          <Link to="/decisions/new">
            <button style={{ fontSize: 13, padding: "9px 18px" }}>
              + New decision
            </button>
          </Link>
        </div>

        {decisions.length === 0 ? (
          <div className="card fade-up-4" style={{
            textAlign: "center", padding: "56px 24px", border: "1px dashed var(--border)"
          }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🧠</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>No decisions logged yet</div>
            <p className="muted" style={{ marginBottom: 20 }}>
              Log your first decision and see your cognitive patterns revealed.
            </p>
            <Link to="/decisions/new">
              <button style={{ fontSize: 14 }}>Log your first decision</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {decisions.map((d, i) => (
              <div
                key={d.decision_id}
                className="card"
                style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", gap: 16,
                  animation: `fadeUp 0.4s ${0.05 * i + 0.3}s both cubic-bezier(0.4,0,0.2,1)`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: "var(--text-primary)" }}>
                    {d.title}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {d.submitted_at
                      ? `Submitted ${new Date(d.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                      : "Draft · not yet submitted"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {d.submitted_at ? (
                    <>
                      <Link to={`/decisions/${d.decision_id}/result`}>
                        <button className="btn-secondary" style={{ fontSize: 12, padding: "8px 14px" }}>
                          View analysis
                        </button>
                      </Link>
                      <Link to={`/decisions/${d.decision_id}/outcome`}>
                        <button className="btn-secondary" style={{ fontSize: 12, padding: "8px 14px" }}>
                          Log outcome
                        </button>
                      </Link>
                    </>
                  ) : (
                    <Link to={`/decisions/new?draft=${d.decision_id}`}>
                      <button className="btn-secondary" style={{ fontSize: 12, padding: "8px 14px" }}>
                        Continue →
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
