import math

def compute_confidence(n: int, k: int = 20):
    return 1 - math.exp(-n / k)


def confidence_tier(n: int):
    if n < 15:
        return "low"
    elif n < 40:
        return "moderate"
    return "high"