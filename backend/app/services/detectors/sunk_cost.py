SUNK_COST_KEYWORDS = {
    "already", "invested", "bought", "paid", "years",
    "used", "spent", "committed", "sunk", "wasted", "lost"
}


def detect_sunk_cost(decision):
    score = 0.0
    evidence = []

    desc = (decision.description or "").lower()
    hits = [kw for kw in SUNK_COST_KEYWORDS if kw in desc]

    if hits:
        score = min(0.4 + len(hits) * 0.1, 0.9)
        evidence.append(
            f"Description contains past-investment language: {', '.join(hits)}"
        )

    return score, evidence
