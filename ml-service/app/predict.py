import os
import joblib
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.features import FEATURE_COLUMNS, construct_features_for_series
from app.inventory_advisor import calculate_inventory_advice

ARTIFACT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'artifacts')
MODEL_FILE = os.path.join(ARTIFACT_DIR, 'demand_model.joblib')

_cached_model = None

def get_model():
    global _cached_model
    if _cached_model is None:
        if os.path.exists(MODEL_FILE):
            _cached_model = joblib.load(MODEL_FILE)
    return _cached_model

def forecast_demand(
    product_id: str,
    product_name: str,
    current_stock: int,
    lead_time_days: int,
    safety_stock: int,
    horizon_days: int,
    historical_sales: List[Dict[str, Any]],
    academic_events: List[Any],
    model_version: str = '1.0.0'
) -> Dict[str, Any]:
    model = get_model()

    # Extract historical sales quantities in chronological order
    if historical_sales and len(historical_sales) > 0:
        sorted_history = sorted(historical_sales, key=lambda x: x['date'] if isinstance(x, dict) else x.date)
        history_series = [float(item['quantity'] if isinstance(item, dict) else item.quantity) for item in sorted_history]
        data_status = 'historical'
        limitations = []
    else:
        # Fallback for cold-start new products
        history_series = [5.0, 6.0, 5.0, 7.0, 4.0, 3.0, 2.0, 6.0, 7.0, 6.0, 8.0, 5.0, 3.0, 2.0]
        data_status = 'cold_start_baseline'
        limitations = ['Cold start: Product has under 7 days of sales history. Forecast initialized using category baseline.']

    daily_predictions = []
    today = datetime.now()
    rolling_history = list(history_series)

    # Recursive multi-horizon forecasting
    for step in range(1, horizon_days + 1):
        target_date = today + timedelta(days=step)
        
        feats = construct_features_for_series(rolling_history, target_date, academic_events)
        feature_vector = np.array([[feats[col] for col in FEATURE_COLUMNS]])

        if model is not None:
            raw_pred = float(model.predict(feature_vector)[0])
        else:
            # High quality statistical baseline if model file is not yet initialized
            raw_pred = feats['rolling_mean_7'] * (0.6 if feats['is_weekend'] else 1.1)
            if feats['is_exam_period'] > 0:
                raw_pred *= 1.4

        pred_units = max(0, int(round(raw_pred)))
        lower_bound = max(0, pred_units - 2)
        upper_bound = pred_units + 3

        daily_predictions.append({
            'date': target_date.strftime('%Y-%m-%d'),
            'day_name': target_date.strftime('%a'),
            'predicted_units': pred_units,
            'lower_bound': lower_bound,
            'upper_bound': upper_bound,
        })

        # Append prediction to rolling history so subsequent lags update recursively
        rolling_history.append(float(pred_units))

    # Calculate intelligent inventory advice
    advice = calculate_inventory_advice(
        current_stock=current_stock,
        lead_time_days=lead_time_days,
        safety_stock=safety_stock,
        daily_predictions=daily_predictions,
    )

    return {
        'product_id': product_id,
        'product_name': product_name,
        'current_stock': current_stock,
        'lead_time_days': lead_time_days,
        'safety_stock': safety_stock,
        'horizon_days': horizon_days,
        'predictions': daily_predictions,
        'total_predicted_demand': advice['total_forecast_demand'],
        'lead_time_demand': advice['lead_time_demand'],
        'reorder_point': advice['reorder_point'],
        'stockout_risk': advice['stockout_risk'],
        'suggested_reorder_quantity': advice['suggested_reorder_quantity'],
        'model_version': model_version,
        'data_status': data_status,
        'limitations': limitations,
    }
