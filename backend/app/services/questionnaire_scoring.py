"""
Questionnaire scoring.

The frontend sends pre-reversed Likert responses — values 1–6 per item,
already adjusted for reverse-scored items. So summing is correct here.

Min/max ranges used for normalization:
  NFC: 6 items × 1–6 scale  → min=6,  max=36
  AOT: 7 items × 1–6 scale  → min=7,  max=42
  MAX: 6 items × 1–6 scale  → min=6,  max=36

CRT and BNT: lists of 0/1 per item, averaged to 0–1.
"""


def _normalize(raw: float, min_val: int, max_val: int) -> float:
    if max_val == min_val:
        return 0.0
    return round((raw - min_val) / (max_val - min_val), 4)


def score_questionnaire(data: dict) -> dict:
    crt_items = data.get("CRT", [])
    bnt_items = data.get("BNT", [])
    nfc_items = data.get("NFC", [])
    aot_items = data.get("AOT", [])
    max_items = data.get("MAX", [])

    if not all([crt_items, bnt_items, nfc_items, aot_items, max_items]):
        raise ValueError("All five instrument sections (CRT, BNT, NFC, AOT, MAX) are required")

    crt_score = round(sum(crt_items) / len(crt_items), 4)
    bnt_score = round(sum(bnt_items) / len(bnt_items), 4)

    nfc_score = _normalize(sum(nfc_items), 6,  36)
    aot_score = _normalize(sum(aot_items), 7,  42)
    max_score = _normalize(sum(max_items), 6,  36)

    return {
        "crt_score": crt_score,
        "bnt_score": bnt_score,
        "nfc_score": nfc_score,
        "aot_score": aot_score,
        "max_score": max_score,
    }
