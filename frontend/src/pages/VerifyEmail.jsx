import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "../api/axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("error"); setMessage("No verification token found."); return; }

    axios.post("/api/auth/verify-email", { token })
      .then(r => { setStatus("success"); setMessage(r.data.message || "Email verified!"); })
      .catch(e => { setStatus("error"); setMessage(e.response?.data?.detail || "Verification failed."); });
  }, [searchParams]);

  return (
    <div className="auth-wrapper" style={{ textAlign: "center" }}>
      <div className="glass-panel fade-up-1">
        {status === "loading" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <h2>Verifying your email…</h2>
            <p className="muted">Just a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Email verified</h2>
            <p className="muted" style={{ marginBottom: 24 }}>{message}</p>
            <Link to="/login"><button>Sign in →</button></Link>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
            <h2 style={{ marginBottom: 8 }}>Verification failed</h2>
            <p className="muted" style={{ marginBottom: 24 }}>{message}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/resend-verification"><button className="btn-secondary">Resend email</button></Link>
              <Link to="/login"><button>Back to sign in</button></Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
