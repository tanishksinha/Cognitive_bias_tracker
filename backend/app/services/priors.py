def compute_priors(profile):

    crt = profile.crt_score
    bnt = profile.bnt_score
    nfc = profile.nfc_score
    aot = profile.aot_score
    max_s = profile.max_score

    return {
        "anchoring": (1 - crt) * 0.7 + (1 - bnt) * 0.3,

        "confirmation":
            (1 - aot) * 0.6 + (1 - nfc) * 0.4,  # corrected

        "overconfidence":
            (1 - crt) * 0.5 + (1 - nfc) * 0.5,

        "bandwagon":
            (1 - aot) * 0.4 + max_s * 0.3 + (1 - crt) * 0.3,

        "sunk_cost":
            max_s * 0.5 + (1 - aot) * 0.5,
    }