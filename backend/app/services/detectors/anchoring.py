def detect_anchoring(decision, options, factors, events):
    score = 0.0
    evidence = []

    # Guard — need at least one option to detect anything
    if not options:
        return 0.0, evidence

    # Signal 1: initial preference matches final choice
    if (decision.initial_preference_option_id is not None
            and decision.initial_preference_option_id == decision.final_choice_option_id):
        score += 0.4
        evidence.append("Initial preference remained unchanged after reviewing all factors")

    # Signal 2: first-listed option was chosen
    sorted_options = sorted(options, key=lambda x: x.position)
    first_option = sorted_options[0]
    if decision.final_choice_option_id == first_option.option_id:
        score += 0.3
        evidence.append("The first option you listed was your final choice")

    # Signal 3: factor weights increased after being added (post-hoc rationalization)
    drifted = [f for f in factors if f.weight_initial is not None and f.weight > f.weight_initial]
    if drifted:
        score += 0.3
        evidence.append(
            f"{len(drifted)} factor(s) had their weight increased after being added"
        )

    return min(score, 1.0), evidence
