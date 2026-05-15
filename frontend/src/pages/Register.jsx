import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", { email, password });
      navigate("/login", {
        state: {
          message: res.data.message || "Account created. Check your email to verify your account.",
        },
      });
    } catch (e) {
      setError(e.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div className="auth-wrapper">
      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "var(--accent)", boxShadow: "0 0 10px var(--accent)",
              display: "inline-block"
            }} />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: 20, color: "var(--text-primary)"
            }}>BiasTracker</span>
          </div>
        </Link>
      </div>

      <div className="glass-panel fade-up-1">
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ marginBottom: 6 }}>Create your account</h2>
          <p className="muted">Start building your cognitive decision profile.</p>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label className="muted" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Email
          </label>
          <input
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKey}
            style={{ marginBottom: 16 }}
          />
          <label className="muted" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Password <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(min. 8 chars)</span>
          </label>
          <input
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={onKey}
            style={{ marginBottom: 24 }}
          />
          <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "13px" }}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </div>

        <div className="divider" style={{ margin: "24px 0 16px" }} />

        <div style={{ textAlign: "center" }}>
          <Link to="/login" style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Already have an account? <span style={{ color: "var(--accent-hover)", fontWeight: 600 }}>Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
