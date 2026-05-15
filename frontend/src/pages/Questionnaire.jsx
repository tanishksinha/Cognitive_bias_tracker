import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const CRT_QUESTIONS = [
  { q: "A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost (in cents)?", correct: 5 },
  { q: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets (in minutes)?", correct: 5 },
  { q: "In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days to cover the lake, how long to cover half the lake (in days)?", correct: 47 },
  { q: "A doctor gives a patient 3 pills and says take one every half hour. How many minutes until all pills are taken?", correct: 60 },
  { q: "If John can drink one barrel of water in 6 days, and Mary can drink one barrel in 12 days, how many days to drink one barrel together?", correct: 4 },
  { q: "Simon invested $8,000 in stocks and bought a rare coin for $1. Next day both went up 100%. He cashed in both. How much more did he gain from the stock than the coin?", correct: 7999 },
  { q: "If you're running a race and you pass the person in second place, what place are you in?", correct: 2 },
];

const LIKERT_LABELS = ["Strongly disagree", "Disagree", "Slightly disagree", "Slightly agree", "Agree", "Strongly agree"];

const NFC_ITEMS = [
  "I prefer complex to simple problems.",
  "I enjoy thinking deeply about things.",
  "Thinking is not my idea of fun.",
  "I like tasks that require little thought once learned.",
  "I would rather do something that requires little thought than something that is sure to challenge my thinking abilities.",
  "I try to anticipate and avoid situations where I would likely have to think hard.",
];
const NFC_REVERSE = new Set([2, 3, 4, 5]);

const AOT_ITEMS = [
  "Changing your mind is a sign of weakness.",
  "I believe that I should look for evidence against my own views.",
  "I avoid situations that require me to reconsider my position.",
  "I try to think about evidence that goes against my beliefs.",
  "I tend to stick with my initial opinion once I've formed it.",
  "When considering a problem, I actively look for viewpoints that differ from mine.",
  "I find it difficult to change my mind even when presented with strong evidence.",
];
const AOT_REVERSE = new Set([0, 2, 4, 6]);

const MAX_ITEMS = [
  "When I am in a car listening to the radio, I often check other stations to see if something better is playing.",
  "I treat relationships like clothing: I expect to try a lot on before finding the perfect fit.",
  "No matter how satisfied I am with my job, it's only right for me to be on the lookout for better opportunities.",
  "I often find it difficult to shop for a gift for a friend because I want it to be perfect.",
  "Renting videos is really difficult. I'm always struggling to pick the best one.",
  "I never settle for second best.",
];
const MAX_REVERSE = new Set([]);

const BNT_QUESTIONS = [
  { q: "Imagine we are throwing a five-sided die 50 times. On average, out of these 50 throws how many times would this five-sided die show an odd number (1, 3, or 5)?", correct: 30 },
  { q: "Out of 1,000 people in a small town 500 are members of a choir. Out of these 500 members 100 are men. Out of the 500 non-members 300 are men. What is the probability that a randomly drawn man is a member of the choir? (fraction, e.g. 25/100)", correct: "25/100", acceptedAnswers: ["25/100", "1/4", "25%", "0.25"] },
  { q: "Imagine we are throwing a loaded die (6 sides). The probability that the die shows a 6 is twice as high as each of the other numbers. On average, out of 70 throws how many times would the die show 6?", correct: 20 },
  { q: "In a forest 20% of mushrooms are red, 50% brown and 30% white. A red mushroom is poisonous with probability 20%. A non-red mushroom is poisonous with probability 5%. What is the probability that a poisonous mushroom picked at random is red? (percentage)", correct: "50%", acceptedAnswers: ["50%", "50", "0.5"] },
];

const SECTIONS = [
  { key: "nfc", title: "Need for Cognition", subtitle: "How you approach thinking and problem-solving" },
  { key: "aot", title: "Actively Open-minded Thinking", subtitle: "How you handle new information and changing your mind" },
  { key: "max", title: "Maximising Tendency", subtitle: "How you approach finding the best possible option" },
  { key: "bnt", title: "Numeracy — Reasoning Puzzles", subtitle: "Enter your answers as numbers or fractions" },
  { key: "crt", title: "Cognitive Reflection", subtitle: "Go with your first instinct, then reconsider" },
];

function LikertSection({ items, reverseSet, values, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {items.map((item, i) => (
        <div key={i} className="card-sm">
          <p style={{ fontSize: 14, marginBottom: 14, color: "var(--text-primary)", fontWeight: 500 }}>{item}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5, 6].map(v => {
              const selected = values[i] === v;
              return (
                <label key={v} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  cursor: "pointer", gap: 6, width: 80, padding: "8px 4px",
                  borderRadius: "var(--radius-md)",
                  background: selected ? "var(--accent-soft)" : "transparent",
                  border: `1px solid ${selected ? "var(--border-accent)" : "transparent"}`,
                  transition: "all 0.15s",
                }}>
                  <input type="radio" name={`item-${i}`} checked={selected} onChange={() => onChange(i, v)}
                    style={{ width: "auto", marginBottom: 0, accentColor: "var(--accent)" }} />
                  <span style={{ fontSize: 11, color: selected ? "var(--accent-hover)" : "var(--text-muted)", textAlign: "center", lineHeight: 1.3 }}>
                    {LIKERT_LABELS[v - 1]}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Questionnaire() {
  const navigate = useNavigate();
  const [section, setSection] = useState(0);
  const [nfc, setNfc] = useState({});
  const [aot, setAot] = useState({});
  const [max, setMax] = useState({});
  const [bntAnswers, setBntAnswers] = useState({});
  const [crtAnswers, setCrtAnswers] = useState({});
  const [error, setError] = useState("");

  const updateLikert = setter => (i, v) => setter(prev => ({ ...prev, [i]: v }));
  const complete = (obj, count) => Object.keys(obj).length === count;

  const canProceed = () => {
    if (section === 0) return complete(nfc, NFC_ITEMS.length);
    if (section === 1) return complete(aot, AOT_ITEMS.length);
    if (section === 2) return complete(max, MAX_ITEMS.length);
    if (section === 3) return complete(bntAnswers, BNT_QUESTIONS.length);
    if (section === 4) return complete(crtAnswers, CRT_QUESTIONS.length);
    return false;
  };

  const scoreLikert = (values, reverseSet, count) =>
    Array.from({ length: count }, (_, i) => {
      const raw = values[i] || 1;
      return reverseSet.has(i) ? 7 - raw : raw;
    });

  const scoreBNT = () => BNT_QUESTIONS.map((q, i) => {
    const ans = String(bntAnswers[i] || "").trim().toLowerCase();
    const accepted = q.acceptedAnswers ? q.acceptedAnswers.map(a => a.toLowerCase()) : [String(q.correct)];
    return accepted.includes(ans) ? 1 : 0;
  });

  const scoreCRT = () => CRT_QUESTIONS.map((q, i) => Number(crtAnswers[i]) === q.correct ? 1 : 0);

  const submit = async () => {
    setError("");
    try {
      await axios.post("/api/profile/questionnaire", {
        NFC: scoreLikert(nfc, NFC_REVERSE, NFC_ITEMS.length),
        AOT: scoreLikert(aot, AOT_REVERSE, AOT_ITEMS.length),
        MAX: scoreLikert(max, MAX_REVERSE, MAX_ITEMS.length),
        BNT: scoreBNT(),
        CRT: scoreCRT(),
      });
      navigate("/dashboard");
    } catch {
      setError("Submission failed. Please try again.");
    }
  };

  const sec = SECTIONS[section];
  const progress = ((section + 1) / SECTIONS.length) * 100;

  return (
    <>
      <nav className="app-nav">
        <div className="brand"><span className="brand-dot" />BiasTracker</div>
        <span className="muted" style={{ fontSize: 13 }}>Section {section + 1} of {SECTIONS.length}</span>
      </nav>

      <div className="page-wrapper">
        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Decision profile assessment
            </span>
            <span style={{ fontSize: 12, color: "var(--accent-hover)", fontWeight: 600 }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Section header */}
        <div className="fade-up-1" style={{ marginBottom: 28 }}>
          <h2 style={{ marginBottom: 6 }}>{sec.title}</h2>
          <p className="muted">{sec.subtitle}</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Section content */}
        <div className="fade-up-2">
          {section === 0 && (
            <LikertSection items={NFC_ITEMS} reverseSet={NFC_REVERSE} values={nfc} onChange={updateLikert(setNfc)} />
          )}
          {section === 1 && (
            <LikertSection items={AOT_ITEMS} reverseSet={AOT_REVERSE} values={aot} onChange={updateLikert(setAot)} />
          )}
          {section === 2 && (
            <LikertSection items={MAX_ITEMS} reverseSet={MAX_REVERSE} values={max} onChange={updateLikert(setMax)} />
          )}
          {section === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {BNT_QUESTIONS.map((q, i) => (
                <div key={i} className="card-sm">
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: "var(--text-primary)" }}>{q.q}</p>
                  <input
                    value={bntAnswers[i] || ""}
                    onChange={e => setBntAnswers({ ...bntAnswers, [i]: e.target.value })}
                    placeholder="Your answer"
                    style={{ width: 220, marginBottom: 0 }}
                  />
                </div>
              ))}
            </div>
          )}
          {section === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {CRT_QUESTIONS.map((q, i) => (
                <div key={i} className="card-sm">
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: "var(--text-primary)" }}>{q.q}</p>
                  <input
                    type="number"
                    value={crtAnswers[i] || ""}
                    onChange={e => setCrtAnswers({ ...crtAnswers, [i]: e.target.value })}
                    placeholder="Your answer"
                    style={{ width: 160, marginBottom: 0 }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          {section > 0 && (
            <button className="btn-secondary" onClick={() => setSection(s => s - 1)} style={{ padding: "11px 22px" }}>
              ← Back
            </button>
          )}
          {section < SECTIONS.length - 1 ? (
            <button onClick={() => setSection(s => s + 1)} disabled={!canProceed()} style={{ padding: "11px 22px" }}>
              Continue →
            </button>
          ) : (
            <button onClick={submit} disabled={!canProceed()} style={{ padding: "11px 22px" }}>
              Submit assessment →
            </button>
          )}
        </div>
      </div>
    </>
  );
}
