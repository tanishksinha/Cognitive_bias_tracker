def detect_confirmation(events):
    score = 0.0
    evidence = []

    # Find when initial preference was set
    pref_time = None
    for e in events:
        if e.event_type == "initial_preference_set":
            pref_time = e.occurred_at
            break  # use the first time it was set

    if pref_time is None:
        return 0.0, evidence

    # Count factors added before vs after preference was set
    factors_before = [e for e in events if e.event_type == "factor_added" and e.occurred_at <= pref_time]
    factors_after  = [e for e in events if e.event_type == "factor_added" and e.occurred_at > pref_time]

    total = len(factors_before) + len(factors_after)
    if total == 0:
        return 0.0, evidence

    ratio = len(factors_after) / total

    if ratio >= 0.6:
        score = 0.4 + (ratio - 0.6) * 1.5  # 0.4 at 60%, up to 1.0 at 100%
        score = min(score, 1.0)
        evidence.append(
            f"{len(factors_after)} of {total} factors were added after setting initial preference"
        )
    elif len(factors_after) > 0:
        score = 0.2
        evidence.append(
            f"{len(factors_after)} factor(s) added after initial preference was set"
        )

    return score, evidence
