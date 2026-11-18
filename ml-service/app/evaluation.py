import numpy as np
from typing import Dict, Any

def evaluate_predictions(actual: np.ndarray, predicted: np.ndarray, baseline: np.ndarray = None) -> Dict[str, float]:
    actual = np.array(actual, dtype=float)
    predicted = np.array(predicted, dtype=float)

    # MAE
    mae = float(np.mean(np.abs(actual - predicted)))

    # RMSE
    rmse = float(np.sqrt(np.mean((actual - predicted) ** 2)))

    # WAPE (Weighted Absolute Percentage Error - zero safe)
    sum_actual = np.sum(actual)
    wape = float((np.sum(np.abs(actual - predicted)) / (sum_actual + 1e-6)) * 100)

    metrics = {
        'mae': round(mae, 3),
        'rmse': round(rmse, 3),
        'wape': round(wape, 2),
    }

    if baseline is not None:
        baseline = np.array(baseline, dtype=float)
        b_mae = float(np.mean(np.abs(actual - baseline)))
        metrics['baseline_mae'] = round(b_mae, 3)

    return metrics
