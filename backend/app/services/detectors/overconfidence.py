CERTAINTY_KEYWORDS = {
    "obviously", "clearly", "definitely", "certainly",
    "everyone knows", "of course", "no doubt", "guaranteed"
}


def detect_overconfidence(ratings):
    score = 0.0
    evidence = []

    if not ratings:
        return 0.0, evidence

    high_count = sum(1 for r in ratings if r.rating >= 9)
    ratio = high_count / len(ratings)

    if ratio > 0.7:
        score += 0.7
        evidence.append(
            f"{high_count} of {len(ratings)} ratings are 9 or 10 out of 10"
        )
    elif ratio > 0.5:
        score += 0.4
        evidence.append(
            f"{high_count} of {len(ratings)} ratings are 9 or 10 out of 10"
        )

    return min(score, 1.0), evidence
