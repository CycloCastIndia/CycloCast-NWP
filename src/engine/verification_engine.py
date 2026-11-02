#!/usr/bin/env python3
"""
CycloCast NWP - Verification Engine (Phase 2)
Computes WMO standard verification metrics:
- Contingency table: Probability of Detection (POD), False Alarm Ratio (FAR), Critical Success Index (CSI), Frequency Bias
- Continuous error: Mean Absolute Error (MAE), Root Mean Square Error (RMSE), Mean Bias
"""

import math
import json
import argparse
from datetime import datetime, timezone

def compute_contingency(hits: int, misses: int, false_alarms: int, correct_negatives: int):
    total = hits + misses + false_alarms + correct_negatives
    pod = hits / (hits + misses) if (hits + misses) > 0 else 0.0
    far = false_alarms / (hits + false_alarms) if (hits + false_alarms) > 0 else 0.0
    csi = hits / (hits + misses + false_alarms) if (hits + misses + false_alarms) > 0 else 0.0
    bias = (hits + false_alarms) / (hits + misses) if (hits + misses) > 0 else 0.0
    
    # Equitable Threat Score (ETS)
    hits_random = ((hits + misses) * (hits + false_alarms)) / total if total > 0 else 0
    ets = (hits - hits_random) / (hits + misses + false_alarms - hits_random) if (hits + misses + false_alarms - hits_random) > 0 else 0.0

    return {
        "hits": hits,
        "misses": misses,
        "false_alarms": false_alarms,
        "correct_negatives": correct_negatives,
        "pod": round(pod, 3),
        "far": round(far, 3),
        "csi": round(csi, 3),
        "frequency_bias": round(bias, 3),
        "ets": round(ets, 3)
    }

def compute_continuous(pairs: list[tuple[float, float]]):
    """pairs: list of (forecast, observed) values"""
    if not pairs:
        return {"mae": 0.0, "rmse": 0.0, "mean_bias": 0.0, "count": 0}
    
    errors = [f - o for f, o in pairs]
    abs_errors = [abs(e) for e in errors]
    sq_errors = [e**2 for e in errors]
    
    mae = sum(abs_errors) / len(pairs)
    rmse = math.sqrt(sum(sq_errors) / len(pairs))
    bias = sum(errors) / len(pairs)
    
    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mean_bias": round(bias, 2),
        "count": len(pairs)
    }

if __name__ == "__main__":
    print(f"[{datetime.now(timezone.utc).isoformat()}] CycloCast Verification Engine initialized.")
    # Demonstration sample verification calculation
    rain_threshold_64mm = compute_contingency(hits=128, misses=32, false_alarms=38, correct_negatives=2285)
    print(f"IMD Heavy Rain Threshold (>= 64.5mm): POD={rain_threshold_64mm['pod']}, FAR={rain_threshold_64mm['far']}, CSI={rain_threshold_64mm['csi']}")
