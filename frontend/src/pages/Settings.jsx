import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleResetProfile = async () => {
    if (!window.confirm("Are you sure you want to reset your cognitive profile? You will need to retake the questionnaire.")) return;
    setLoading(true);
    try {
      await axios.delete("/api/profile/me");
      setMessage("Profile reset successfully.");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage("Error resetting profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("CRITICAL: This will permanently delete your account and all your decisions. This cannot be undone. Are you absolutely sure?")) return;
    setLoading(true);
    try {
      await axios.delete("/api/auth/account");
      localStorage.removeItem("token");
      navigate("/");
    } catch (err) {
      setMessage("Error deleting account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="app-nav">
        <div className="brand">
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, color: "inherit", textDecoration: "none" }}>
            <span className="brand-dot" />
            BiasTracker
          </Link>
        </div>
        <Link to="/dashboard">
          <button className="btn-ghost" style={{ fontSize: 13 }}>Back to Dashboard</button>
        </Link>
      </nav>

      <div className="page-wrapper fade-in">
        <h1 style={{ fontSize: "1.75rem", marginBottom: 32 }}>Settings</h1>

        {message && (
          <div className="alert alert-warning" style={{ marginBottom: 24 }}>{message}</div>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Cognitive Profile</h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
            Resetting your profile will clear your CRT, BNT, NFC, and AOT scores. 
            You will need to retake the 15-minute assessment to establish a new baseline.
          </p>
          <button 
            onClick={handleResetProfile} 
            className="btn-secondary" 
            disabled={loading}
          >
            Reset Profile Baseline
          </button>
        </div>

        <div className="card" style={{ border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 8, color: "var(--red)" }}>Danger Zone</h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
            Permanently delete your account and all associated data. This action is irreversible.
          </p>
          <button 
            onClick={handleDeleteAccount} 
            className="btn-secondary" 
            style={{ borderColor: "rgba(239, 68, 68, 0.5)", color: "var(--red)" }}
            disabled={loading}
          >
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
}
