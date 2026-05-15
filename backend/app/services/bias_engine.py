from app.services.detectors.anchoring import detect_anchoring
from app.services.detectors.confirmation import detect_confirmation
from app.services.detectors.overconfidence import detect_overconfidence
from app.services.detectors.bandwagon import detect_bandwagon
from app.services.detectors.sunk_cost import detect_sunk_cost
from app.services.priors import compute_priors
from app.services.confidence import compute_confidence, confidence_tier


def run_bias_engine(user, profile, decision, options, factors, events, ratings):

    # Fall back to neutral priors if no profile yet
    if profile:
        priors = compute_priors(profile)
    else:
        priors = {
            "anchoring": 0.5,
            "confirmation": 0.5,
            "overconfidence": 0.5,
            "bandwagon": 0.5,
            "sunk_cost": 0.5,
        }

    n = user.decision_count
    conf = compute_confidence(n)
    tier = confidence_tier(n)

    raw_signals = {
        "anchoring":      detect_anchoring(decision, options, factors, events),
        "confirmation":   detect_confirmation(events),
        "overconfidence": detect_overconfidence(ratings),
        "bandwagon":      detect_bandwagon(decision, factors),
        "sunk_cost":      detect_sunk_cost(decision),
    }

    results = []
    total = 0.0

    for bias, (signal_score, evidence) in raw_signals.items():
        prior = priors.get(bias, 0.5)
        combined = conf * signal_score + (1 - conf) * prior
        results.append({
            "bias": bias,
            "signal_strength": round(signal_score, 4),
            "prior": round(prior, 4),
            "combined": combined,
            "evidence": evidence,
            "confidence": tier,
        })
        total += combined

    # Normalize to posterior distribution summing to 1
    for r in results:
        r["posterior"] = round(r["combined"] / total, 4) if total else 0.0
        del r["combined"]

    results.sort(key=lambda x: x["posterior"], reverse=True)
    return results
