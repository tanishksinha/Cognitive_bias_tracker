import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

export default function Outcome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [satisfaction, setSatisfaction] = useState(null);
  const [repeat, setRepeat]             = useState(null);
  const [notes, setNotes]               = useState("");
  const [error, setError]               = useState("");
  const [done, setDone]                 = useState(false);

  const submit = async () => {
    if (satisfaction === null || repeat === null) {
      setError("Please answer both questions before submitting.");
      return;
    }
    setError("");
    try {
      await axios.post(`/api/decisions/${id}/outcome`, { satisfaction, repeat, notes });
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.detail || "Submission failed.");
    }
  };

  if (done) return (
    <>
      <nav className="app-nav">
        <div className="brand"><span className="brand-dot" />BiasTracker</div>
        <Link to="/dashboard"><button className="btn-ghost" style={{ fontSize: 13 }}>← Dashboard</button></Link>
      </nav>
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
        <h2 style={{ marginBottom: 8 }}>Outcome recorded</h2>
        <p className="muted" style={{ marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
          Your reflection helps the system build a more accurate picture of your decision patterns over time.
        </p>
        <Link to="/dashboard">
          <button>← Back to dashboard</button>
        </Link>
      </div>
    </>
  );

  return (
    <>
      <nav className="app-nav">
        <div className="brand"><span className="brand-dot" />BiasTracker</div>
        <Link to="/dashboard"><button className="btn-ghost" style={{ fontSize: 13 }}>← Dashboard</button></Link>
      </nav>

      <div className="page-wrapper" style={{ maxWidth: 620 }}>
        <div className="fade-up-1" style={{ marginBottom: 28 }}>
          <h2 style={{ marginBottom: 6 }}>How did this decision turn out?</h2>
          <p className="muted">Your reflection helps build a more accurate cognitive profile over time.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Satisfaction */}
        <div className="card fade-up-2" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>How satisfied are you with how this turned out?</div>
          <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>1 = very unsatisfied · 5 = very satisfied</p>
          <div style={{ display: "flex", gap: 10 }}>
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => setSatisfaction(v)}
                style={{
                  width: 48, height: 48, borderRadius: "50%", padding: 0,
                  fontWeight: 700, fontSize: 15,
                  background: satisfaction === v ? "var(--accent)" : "var(--bg-card)",
                  color: satisfaction === v ? "white" : "var(--text-secondary)",
                  border: `1px solid ${satisfaction === v ? "var(--accent)" : "var(--border)"}`,
                  boxShadow: satisfaction === v ? "var(--shadow-glow)" : "none",
                  transition: "all 0.2s",
                }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Repeat */}
        <div className="card fade-up-3" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Would you make the same decision again?</div>
          <div style={{ display: "flex", gap: 12 }}>
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => setRepeat(v)}
                style={{
                  padding: "10px 28px",
                  background: repeat === v ? "var(--accent)" : "var(--bg-card)",
                  color: repeat === v ? "white" : "var(--text-secondary)",
                  border: `1px solid ${repeat === v ? "var(--accent)" : "var(--border)"}`,
                  boxShadow: repeat === v ? "var(--shadow-glow)" : "none",
                  transition: "all 0.2s",
                }}>
                {v ? "Yes" : "No"}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="card fade-up-4" style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Any reflections? <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></div>
          <textarea
            value={notes}
            rows={4}
            placeholder="Looking back, what do you notice about how you made this decision?"
            onChange={e => setNotes(e.target.value)}
            style={{ resize: "vertical", marginBottom: 0 }}
          />
        </div>

        <button onClick={submit} style={{ padding: "13px 28px" }}>
          Submit reflection →
        </button>
      </div>
    </>
  );
}
