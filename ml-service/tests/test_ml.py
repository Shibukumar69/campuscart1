import pytest
import numpy as np
from datetime import datetime, timedelta
from app.features import compute_academic_event_features, construct_features_for_series, FEATURE_COLUMNS
from app.evaluation import evaluate_predictions
from app.inventory_advisor import calculate_inventory_advice
from app.predict import forecast_demand

def test_feature_generation_no_leakage():
    sales = [5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0]
    target_date = datetime(2026, 11, 1)
    events = [
        {'title': 'Test Mid Sem', 'type': 'MID_TERM_EXAMS', 'start_date': '2026-11-05', 'end_date': '2026-11-10'},
    ]

    feats = construct_features_for_series(sales, target_date, events)

    assert len(feats) == len(FEATURE_COLUMNS)
    assert feats['lag_1'] == 18.0
    assert feats['lag_2'] == 17.0
    assert feats['days_to_next_exam'] == 4.0
    assert feats['is_exam_period'] == 0.0

def test_academic_event_during_exam():
    target_date = datetime(2026, 11, 7)
    events = [
        {'title': 'Test Mid Sem', 'type': 'MID_TERM_EXAMS', 'start_date': '2026-11-05', 'end_date': '2026-11-10'},
    ]
    feats = compute_academic_event_features(target_date, events)
    assert feats['is_exam_period'] == 1.0

def test_evaluation_metrics():
    actual = np.array([10.0, 12.0, 14.0, 8.0])
    pred = np.array([9.0, 11.0, 15.0, 8.0])
    metrics = evaluate_predictions(actual, pred)

    assert 'mae' in metrics
    assert 'rmse' in metrics
    assert 'wape' in metrics
    assert metrics['mae'] >= 0.0

def test_inventory_advisor_reorder_point():
    current_stock = 25
    lead_time_days = 2
    safety_stock = 10
    daily_preds = [{'date': '2026-11-01', 'predicted_units': 9}] * 7

    advice = calculate_inventory_advice(
        current_stock=current_stock,
        lead_time_days=lead_time_days,
        safety_stock=safety_stock,
        daily_predictions=daily_preds,
    )

    # Lead time demand = 9 * 2 = 18
    # Reorder point = 18 + 10 = 28
    assert advice['lead_time_demand'] == 18
    assert advice['reorder_point'] == 28
    assert advice['reorder_needed'] == True # 25 <= 28
    assert advice['suggested_reorder_quantity'] > 0

def test_forecast_cold_start():
    res_7 = forecast_demand(
        product_id="test-prod-1",
        product_name="Test Spiral Notebook",
        current_stock=20,
        lead_time_days=2,
        safety_stock=10,
        horizon_days=7,
        historical_sales=[],
        academic_events=[],
    )

    assert len(res_7['predictions']) == 7
    assert res_7['data_status'] == 'cold_start_baseline'
    for pt in res_7['predictions']:
        assert pt['predicted_units'] >= 0
        assert pt['lower_bound'] >= 0

def test_forecast_30_days_horizon():
    res_30 = forecast_demand(
        product_id="test-prod-2",
        product_name="Reynolds Gel Pen",
        current_stock=40,
        lead_time_days=3,
        safety_stock=15,
        horizon_days=30,
        historical_sales=[{'date': '2026-10-01', 'quantity': 10}],
        academic_events=[],
    )

    assert len(res_30['predictions']) == 30
    assert res_30['total_predicted_demand'] > 0
