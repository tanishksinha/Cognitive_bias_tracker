SOCIAL_KEYWORDS = {
    "friend", "friends", "everyone", "people", "popular",
    "told", "suggested", "recommendation", "others", "trend",
    "common", "most", "usually", "normally"
}


def detect_bandwagon(decision, factors):
    score = 0.0
    evidence = []

    active_factors = [f for f in factors]
    if not active_factors:
        return 0.0, evidence

    social_factors = [
        f for f in active_factors
        if any(kw in f.label.lower() for kw in SOCIAL_KEYWORDS)
    ]

    if social_factors:
        avg_weight = sum(f.weight for f in active_factors) / len(active_factors)
        social_avg = sum(f.weight for f in social_factors) / len(social_factors)

        if social_avg > avg_weight * 1.5:
            score += 0.6
            evidence.append(
                f"Social factors weighted {social_avg:.1f} vs average {avg_weight:.1f}"
            )
        else:
            score += 0.3
            evidence.append("At least one factor references others' opinions")

    desc = (decision.description or "").lower()
    if any(kw in desc for kw in SOCIAL_KEYWORDS):
        if not social_factors:
            score += 0.3
            evidence.append("Decision description references others' opinions or popularity")

    return min(score, 1.0), evidence
