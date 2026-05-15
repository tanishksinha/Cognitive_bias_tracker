import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";

const CONFIDENCE_NOTE = {
  low:      "Profile confidence strengthens after 15 decisions. Analysis uses neutral priors as baseline.",
  moderate: "Based on your decision history. Confidence strengthens further after 40 decisions.",
  high:     "High-confidence analysis based on your full decision history.",
};

const BAR_COLORS = {
  anchoring:      "#7c6fe0",
  confirmation:   "#4ecdc4",
  overconfidence: "#f0a04b",
  bandwagon:      "#e06b8b",
  sunk_cost:      "#a78bfa",
};

const BIAS_EXPLAIN = {
  anchoring:      "Over-relying on the first piece of information you encountered.",
  confirmation:   "Favouring information that confirms your pre-existing beliefs.",
  overconfidence: "Overestimating the accuracy of your own judgements.",
  bandwagon:      "Making decisions based on what others are doing.",
  sunk_cost:      "Continuing because of past investments, not future value.",
};

function formatBias(bias) {
  return bias.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function Result() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`/api/decisions/${id}/analysis`)
      .then(r => setResults(r.data.analysis))
      .catch(() => setError("Could not load analysis. The decision may not be submitted yet."));
  }, [id]);

  if (error) return (
    <>
      <nav className="app-nav">
        <div className="brand"><span className="brand-dot" />BiasTracker</div>
        <Link to="/dashboard"><button className="btn-ghost" style={{ fontSize: 13 }}>← Dashboard</button></Link>
      </nav>
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: 60 }}>
        <div className="alert alert-error">{error}</div>
        <Link to="/dashboard"><button className="btn-secondary" style={{ marginTop: 16 }}>← Back to dashboard</button></Link>
      </div>
    </>
  );

  if (!results) return (
    <>
      <nav className="app-nav">
        <div className="brand"><span className="brand-dot" />BiasTracker</div>
      </nav>
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: 80 }}>
        <p className="muted">Crunching the numbers…</p>
      </div>
    </>
  );

  const top  = results[0];
  const tier = top?.confidence;

  return (
    <>
      <nav className="app-nav">
        <div className="brand"><span className="brand-dot" />BiasTracker</div>
        <Link to="/dashboard"><button className="btn-ghost" style={{ fontSize: 13 }}>← Dashboard</button></Link>
      </nav>

      <div className="page-wrapper">
        {/* Header */}
        <div className="fade-up-1" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>Bias analysis</h2>
            <span className="badge badge-accent" style={{ textTransform: "capitalize" }}>{tier} confidence</span>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>{CONFIDENCE_NOTE[tier]}</p>
        </div>

        {/* Confidence disclaimer */}
        <div className="alert alert-info fade-up-2" style={{ marginBottom: 24, fontSize: 13 }}>
          These scores show <strong>how consistent your decision patterns are with each bias</strong> —
          not whether the bias caused the outcome. A high score means the behavioural signature was present.
        </div>

        {/* Top bias callout */}
        <div className="card fade-up-3" style={{
          marginBottom: 20,
          background: `linear-gradient(135deg, ${BAR_COLORS[top.bias]}18, transparent)`,
          borderColor: `${BAR_COLORS[top.bias]}44`,
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `${BAR_COLORS[top.bias]}22`,
              border: `2px solid ${BAR_COLORS[top.bias]}66`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: 20,
            }}>
              🎯
            </div>
            <div>
              <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Strongest signal
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, color: BAR_COLORS[top.bias] }}>
                {formatBias(top.bias)}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {BIAS_EXPLAIN[top.bias]}
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: BAR_COLORS[top.bias] }}>
                {(top.posterior * 100).toFixed(0)}%
              </div>
              <div className="muted" style={{ fontSize: 11 }}>posterior</div>
            </div>
          </div>
        </div>

        {/* All bias cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {results.map((r, i) => (
            <div key={i} className="card fade-up-4" style={{
              animation: `fadeUp 0.4s ${0.05 * i + 0.4}s both cubic-bezier(0.4,0,0.2,1)`,
            }}>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: BAR_COLORS[r.bias] || "#888",
                    boxShadow: `0 0 8px ${BAR_COLORS[r.bias]}99`,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{formatBias(r.bias)}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 16, color: BAR_COLORS[r.bias] || "var(--text-primary)" }}>
                  {(r.posterior * 100).toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="progress-track" style={{ marginBottom: 12 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${r.posterior * 100}%`,
                    background: BAR_COLORS[r.bias] || "var(--accent)",
                  }}
                />
              </div>

              {/* Evidence */}
              {r.evidence.length > 0 ? (
                <ul style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                  {r.evidence.map((e, idx) => <li key={idx} style={{ marginBottom: 2 }}>{e}</li>)}
                </ul>
              ) : (
                <p className="muted" style={{ fontSize: 13, margin: 0 }}>No strong signal detected for this bias.</p>
              )}

              {/* Prior vs signal breakdown for top */}
              {i === 0 && (
                <div style={{
                  marginTop: 12, paddingTop: 12,
                  borderTop: "1px solid var(--border)",
                  display: "flex", gap: 20, fontSize: 12, color: "var(--text-muted)",
                }}>
                  <span>Profile susceptibility: <strong style={{ color: "var(--text-secondary)" }}>{(r.prior * 100).toFixed(0)}%</strong></span>
                  <span>Decision signal: <strong style={{ color: "var(--text-secondary)" }}>{(r.signal_strength * 100).toFixed(0)}%</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 28 }}>
          <Link to={`/decisions/${id}/outcome`}>
            <button style={{ padding: "12px 24px" }}>
              Log how this turned out →
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
