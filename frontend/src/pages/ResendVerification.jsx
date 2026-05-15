import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

export default function ResendVerification() {
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState("idle"); // idle | success | error
  const [message, setMessage] = useState("");

  const submit = async () => {
    setStatus("idle");
    try {
      const res = await axios.post("/api/auth/resend-verification", { email });
      setMessage(res.data.message || "Verification email sent.");
      setStatus("success");
    } catch (e) {
      setMessage(e.response?.data?.detail || "Failed to resend. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel fade-up-1">
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 6 }}>Resend verification</h2>
          <p className="muted">Enter the email you registered with and we'll resend the link.</p>
        </div>

        {status === "success" && <div className="alert alert-success" style={{ marginBottom: 16 }}>{message}</div>}
        {status === "error"   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{message}</div>}

        <input
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          style={{ marginBottom: 16 }}
        />
        <button onClick={submit} style={{ width: "100%", padding: "13px" }}>
          Resend verification email
        </button>

        <div className="divider" style={{ margin: "20px 0 16px" }} />
        <div style={{ textAlign: "center" }}>
          <Link to="/login" style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
