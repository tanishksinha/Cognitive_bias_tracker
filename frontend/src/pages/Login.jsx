import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) setInfo(location.state.message);
    if (location.state?.verificationLink) setVerificationLink(location.state.verificationLink);
  }, [location.state]);

  const submit = async () => {
    setError(""); setInfo("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (e) {
      const detail = e.response?.data?.detail;
      if (detail === "Email is not verified") {
        setError("Email not verified. Check your inbox or resend below.");
      } else {
        setError(detail || "Invalid email or password.");
      }
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
          <h2 style={{ marginBottom: 6 }}>Welcome back</h2>
          <p className="muted">Sign in to continue tracking your decisions.</p>
        </div>

        {info && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            {info}
          </div>
        )}
        {error && <p className="error-text">{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label className="muted" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Email
          </label>
          <input
            placeholder="you@example.com"
            value={email}
            type="email"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKey}
            style={{ marginBottom: 16 }}
          />
          <label className="muted" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Password
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>

        <div className="divider" style={{ margin: "24px 0 16px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <Link to="/register" style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Don't have an account? <span style={{ color: "var(--accent-hover)", fontWeight: 600 }}>Create one</span>
          </Link>
          <Link to="/resend-verification" style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Resend verification email
          </Link>
        </div>
      </div>
    </div>
  );
}
