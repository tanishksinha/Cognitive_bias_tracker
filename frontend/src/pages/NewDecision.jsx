import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "../api/axios";
import { useEventLogger } from "../hooks/useEventLogger";

export default function NewDecision() {
  const [title, setTitle]                   = useState("");
  const [description, setDescription]       = useState("");
  const [options, setOptions]               = useState(["", ""]);
  const [factors, setFactors]               = useState([{ label: "", weight: 5 }]);
  const [ratings, setRatings]               = useState({});
  const [initialPrefIndex, setInitialPrefIndex] = useState(null);
  const [decisionId, setDecisionId]         = useState(null);
  const [optionIds, setOptionIds]           = useState([]);
  const [saved, setSaved]                   = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [loadingDraft, setLoadingDraft]     = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logEvent } = useEventLogger(decisionId);

  /* ── Load draft ─────────────────────────────────────── */
  useEffect(() => {
    const draftId = searchParams.get("draft");
    if (!draftId) return;
    setLoadingDraft(true);
    axios.get(`/api/decisions/${draftId}/draft`)
      .then(res => {
        const d = res.data;
        setTitle(d.title);
        setDescription(d.description || "");
        setOptions(d.options.map(o => o.label));
        setFactors(d.factors.map(f => ({ label: f.label, weight: f.weight })));
        setDecisionId(d.decision_id);
        setOptionIds(d.options.map(o => o.option_id));
        if (d.initial_preference_option_id != null) {
          const idx = d.options.findIndex(o => o.option_id === d.initial_preference_option_id);
          if (idx !== -1) setInitialPrefIndex(idx);
        }
        setSaved(true);
      })
      .catch(() => setError("Could not load draft. It may have been deleted or already submitted."))
      .finally(() => setLoadingDraft(false));
  }, [searchParams]);

  /* ── Save draft ─────────────────────────────────────── */
  const saveDecision = async () => {
    if (!title.trim()) { setError("Please enter a title."); return; }
    if (options.some(o => !o.trim())) { setError("All options need a label."); return; }
    if (factors.some(f => !f.label.trim())) { setError("All factors need a label."); return; }
    setError(""); setSaving(true);
    try {
      const res = await axios.post("/api/decisions/", { title, description, options, factors });
      setDecisionId(res.data.decision_id);
      setOptionIds(res.data.options.map(o => o.option_id));
      setSaved(true);
      logEvent("decision_created", { option_count: options.length, factor_count: factors.length });
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Helpers ────────────────────────────────────────── */
  const addOption = () => { setOptions([...options, ""]); logEvent("option_added"); };
  const updateOption = (i, val) => { const u = [...options]; u[i] = val; setOptions(u); };

  const addFactor = () => { setFactors([...factors, { label: "", weight: 5 }]); logEvent("factor_added", { weight: 5 }); };
  const updateFactor = (i, field, val) => {
    const u = [...factors];
    const old = u[i].weight;
    u[i] = { ...u[i], [field]: val };
    setFactors(u);
    if (field === "weight") logEvent("factor_weight_changed", { factor_index: i, old_weight: old, new_weight: val });
  };
  const removeFactor = (i) => { if (factors.length > 1) setFactors(factors.filter((_, idx) => idx !== i)); };
  const removeOption = (i) => { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)); };

  const updateRating = (optIdx, facIdx, val) =>
    setRatings({ ...ratings, [`${optIdx}-${facIdx}`]: Number(val) });

  const setInitialPref = (idx) => {
    setInitialPrefIndex(idx);
    logEvent("initial_preference_set", { option_index: idx });
  };

  /* ── Submit ─────────────────────────────────────────── */
  const submit = async () => {
    if (initialPrefIndex === null) { setError("Select your initial preference before submitting."); return; }
    setError(""); setSubmitting(true);
    try {
      const ratingPayload = [];
      for (let o = 0; o < options.length; o++)
        for (let f = 0; f < factors.length; f++)
          ratingPayload.push({ option_id: optionIds[o], factor_index: f, rating: ratings[`${o}-${f}`] || 5 });

      await axios.post("/api/ratings/batch", { decision_id: decisionId, ratings: ratingPayload });
      await axios.post(`/api/decisions/${decisionId}/submit`, {
        final_choice: optionIds[initialPrefIndex],
        initial_preference: optionIds[initialPrefIndex],
      });
      navigate(`/decisions/${decisionId}/result`);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDraft) return (
    <>
      <nav className="app-nav">
        <div className="brand"><span className="brand-dot" />BiasTracker</div>
        <Link to="/dashboard"><button className="btn-ghost" style={{ fontSize: 13 }}>← Dashboard</button></Link>
      </nav>
      <div className="page-wrapper" style={{ textAlign: "center", paddingTop: 80 }}>
        <p className="muted">Loading draft…</p>
      </div>
    </>
  );

  /* ── Progress indicator ─────────────────────────────── */
  const step = saved ? 2 : 1;
  const STEPS = ["Set up", "Rate & submit"];

  return (
    <>
      <nav className="app-nav">
        <div className="brand"><span className="brand-dot" />BiasTracker</div>
        <Link to="/dashboard"><button className="btn-ghost" style={{ fontSize: 13 }}>← Dashboard</button></Link>
      </nav>

      <div className="page-wrapper">
        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: i + 1 <= step ? "var(--accent)" : "var(--bg-elevated)",
                color: i + 1 <= step ? "white" : "var(--text-muted)",
                border: `1px solid ${i + 1 <= step ? "var(--accent)" : "var(--border)"}`,
                transition: "all 0.3s",
              }}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: i + 1 <= step ? "var(--text-primary)" : "var(--text-muted)",
              }}>{s}</span>
              {i < STEPS.length - 1 && (
                <div style={{ width: 32, height: 1, background: "var(--border)", margin: "0 4px" }} />
              )}
            </div>
          ))}
        </div>

        <h2 style={{ marginBottom: 4 }}>{saved ? "Rate your options" : "New decision"}</h2>
        <p className="muted" style={{ marginBottom: 28 }}>
          {saved
            ? "Rate how well each option satisfies each factor, then submit for analysis."
            : "Describe the decision, add your options, and define what factors matter to you."}
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* ── STEP 1: Setup ───────────────────────── */}
        {!saved && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Title + desc */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: 14, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Decision details
              </h3>
              <input placeholder="Decision title" value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 12 }} />
              <textarea
                placeholder="What's the context? (optional — but better analysis)"
                value={description} rows={3}
                onChange={e => setDescription(e.target.value)}
                style={{ resize: "vertical", marginBottom: 0 }}
              />
            </div>

            {/* Options */}
            <div className="card">
              <h3 style={{ marginBottom: 4, fontSize: 14, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Options
              </h3>
              <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
                Select which one you're leaning toward before adding factors — this captures your gut instinct.
              </p>
              {options.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                  <input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <label style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, color: initialPrefIndex === i ? "var(--accent-hover)" : "var(--text-muted)",
                    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    fontWeight: initialPrefIndex === i ? 600 : 400,
                  }}>
                    <input type="radio" name="initial_pref" checked={initialPrefIndex === i} onChange={() => setInitialPref(i)} />
                    My pick
                  </label>
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="btn-ghost"
                      style={{ padding: "6px 10px", fontSize: 16, color: "var(--text-muted)" }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={addOption} className="btn-secondary" style={{ fontSize: 13, marginTop: 4 }}>
                + Add option
              </button>
            </div>

            {/* Factors */}
            <div className="card">
              <h3 style={{ marginBottom: 4, fontSize: 14, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Factors
              </h3>
              <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
                What matters most? Weight each factor 1–10.
              </p>
              {factors.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                  <input
                    placeholder={`Factor ${i + 1} (e.g. Cost, Time, Risk)`}
                    value={f.label}
                    onChange={e => updateFactor(i, "label", e.target.value)}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <input
                    type="number" min={1} max={10} value={f.weight}
                    onChange={e => updateFactor(i, "weight", Number(e.target.value))}
                    style={{ width: 64, textAlign: "center", marginBottom: 0 }}
                  />
                  <span className="muted" style={{ fontSize: 12, flexShrink: 0 }}>/ 10</span>
                  {factors.length > 1 && (
                    <button onClick={() => removeFactor(i)} className="btn-ghost"
                      style={{ padding: "6px 10px", fontSize: 16, color: "var(--text-muted)" }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={addFactor} className="btn-secondary" style={{ fontSize: 13, marginTop: 4 }}>
                + Add factor
              </button>
            </div>

            <button onClick={saveDecision} disabled={saving} style={{ alignSelf: "flex-start", padding: "12px 28px" }}>
              {saving ? "Saving…" : "Save & continue →"}
            </button>
          </div>
        )}

        {/* ── STEP 2: Rate & submit ────────────────── */}
        {saved && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {options.map((opt, o) => (
              <div className="card" key={o}>
                <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 15, color: "var(--text-primary)" }}>
                  {opt || `Option ${o + 1}`}
                  {initialPrefIndex === o && (
                    <span className="badge badge-accent" style={{ marginLeft: 10, fontSize: 10 }}>
                      Your initial pick
                    </span>
                  )}
                </div>
                {factors.map((f, fi) => (
                  <div key={fi} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{f.label || `Factor ${fi + 1}`}</span>
                      <span className="muted" style={{ marginLeft: 6, fontSize: 12 }}>weight {f.weight}</span>
                    </div>
                    <input
                      type="number" min={1} max={10}
                      value={ratings[`${o}-${fi}`] || ""}
                      placeholder="5"
                      onChange={e => updateRating(o, fi, e.target.value)}
                      style={{ width: 70, textAlign: "center", marginBottom: 0 }}
                    />
                    <span className="muted" style={{ fontSize: 12 }}>/ 10</span>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ marginTop: 8 }}>
              <button onClick={submit} disabled={submitting} style={{ padding: "13px 28px" }}>
                {submitting ? "Analysing…" : "Submit & analyse →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
