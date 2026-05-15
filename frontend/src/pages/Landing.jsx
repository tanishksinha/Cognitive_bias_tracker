import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const BIASES = [
  { name: "Anchoring", desc: "Over-relying on the first piece of information seen.", color: "#7c6fe0" },
  { name: "Confirmation", desc: "Seeking info that confirms existing beliefs.", color: "#4ecdc4" },
  { name: "Overconfidence", desc: "Overestimating the accuracy of your own judgements.", color: "#f0a04b" },
  { name: "Bandwagon", desc: "Doing things because others are doing them.", color: "#e06b8b" },
  { name: "Sunk Cost", desc: "Continuing a path because of past investments.", color: "#a78bfa" },
];

export default function Landing() {
  return (
    <div className="landing-root">

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="lnav-brand">
          <span className="lnav-dot" />
          BiasTracker
        </div>
        <div className="lnav-actions">
          <Link to="/login" className="lnav-link">Sign in</Link>
          <Link to="/register" className="lnav-cta">Get started</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          Cognitive Decision Science
        </div>
        <h1 className="hero-title">
          Understand how your<br />
          <span className="hero-highlight">biases shape</span> decisions.
        </h1>
        <p className="hero-sub">
          BiasTracker analyses your decision-making patterns using validated
          psychological instruments, surfacing the cognitive biases that
          influence your choices — before they cost you.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="hero-btn-primary">
            Start your profile
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link to="/login" className="hero-btn-ghost">Already have an account</Link>
        </div>

        {/* floating stat pills */}
        <div className="hero-pills">
          <div className="pill">
            <span className="pill-val">5</span>
            <span className="pill-label">Bias detectors</span>
          </div>
          <div className="pill">
            <span className="pill-val">Bayesian</span>
            <span className="pill-label">scoring engine</span>
          </div>
          <div className="pill">
            <span className="pill-val">4</span>
            <span className="pill-label">Psych instruments</span>
          </div>
        </div>
      </section>

      {/* ── What we track ────────────────────────────── */}
      <section className="landing-section">
        <div className="section-label">What we detect</div>
        <h2 className="section-title">Five biases. One unified picture.</h2>
        <div className="bias-grid">
          {BIASES.map((b) => (
            <div className="bias-card" key={b.name}>
              <div className="bias-dot" style={{ background: b.color, boxShadow: `0 0 12px ${b.color}88` }} />
              <div>
                <div className="bias-name">{b.name}</div>
                <div className="bias-desc">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="landing-section">
        <div className="section-label">How it works</div>
        <h2 className="section-title">Science-backed. Built for clarity.</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>Build your baseline</h3>
            <p>Complete a 15-minute assessment using four validated instruments — CRT, BNT, NFC, and AOT — to map your natural decision-making style.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Log your decisions</h3>
            <p>Walk through each decision structurally — options, factors, weights, and your gut instinct — so every data point is captured.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>See your analysis</h3>
            <p>A Bayesian engine blends your profile with live decision signals to generate a posterior bias distribution — your personalised cognitive fingerprint.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <h2>Ready to understand yourself better?</h2>
          <p>Join and start tracking the patterns behind your decisions today.</p>
          <Link to="/register" className="hero-btn-primary" style={{ marginTop: 8 }}>
            Create free account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="landing-footer">
        <span className="lnav-brand" style={{ fontSize: 14 }}>
          <span className="lnav-dot" style={{ width: 6, height: 6 }} />
          BiasTracker
        </span>
        <span style={{ color: 'rgba(240,240,248,0.3)', fontSize: 13 }}>
          Cognitive Decision Science
        </span>
      </footer>
    </div>
  );
}
