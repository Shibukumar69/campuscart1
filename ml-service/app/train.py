import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from app.features import FEATURE_COLUMNS, construct_features_for_series
from app.evaluation import evaluate_predictions

ARTIFACT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'artifacts')
os.makedirs(ARTIFACT_DIR, exist_ok=True)

MODEL_FILE = os.path.join(ARTIFACT_DIR, 'demand_model.joblib')
METRICS_FILE = os.path.join(ARTIFACT_DIR, 'metrics.json')

def generate_training_dataset(days_history: int = 120):
    """
    Generates synthetic academic campus training time-series with realistic exam spikes,
    weekend dips, and semester seasonality to train the core estimator.
    """
    np.random.seed(42)
    start_date = datetime.now() - timedelta(days=days_history)
    
    mock_events = [
        {'title': 'Past Mid Term', 'type': 'MID_TERM_EXAMS', 'start_date': (start_date + timedelta(days=30)).strftime('%Y-%m-%d'), 'end_date': (start_date + timedelta(days=36)).strftime('%Y-%m-%d')},
        {'title': 'Past Project Deadline', 'type': 'PROJECT_SUBMISSION', 'start_date': (start_date + timedelta(days=60)).strftime('%Y-%m-%d'), 'end_date': (start_date + timedelta(days=60)).strftime('%Y-%m-%d')},
        {'title': 'Past End Sem', 'type': 'END_SEM', 'start_date': (start_date + timedelta(days=90)).strftime('%Y-%m-%d'), 'end_date': (start_date + timedelta(days=104)).strftime('%Y-%m-%d')},
    ]

    dates = [start_date + timedelta(days=i) for i in range(days_history)]
    raw_sales = []

    for d in dates:
        day_of_week = d.weekday()
        base = 8.0 if day_of_week < 5 else 3.5

        # Proximity to past exam
        exam_boost = 0.0
        for ev in mock_events:
            ev_start = datetime.strptime(ev['start_date'], '%Y-%m-%d')
            ev_end = datetime.strptime(ev['end_date'], '%Y-%m-%d')
            if ev_start <= d <= ev_end:
                exam_boost += 6.5
            elif 0 <= (ev_start - d).days <= 5:
                exam_boost += 4.0

        noise = np.random.normal(0, 1.2)
        sale = max(0.0, round(base + exam_boost + noise))
        raw_sales.append(sale)

    X_data, y_data = [], []
    for i in range(15, days_history):
        target_date = dates[i]
        history_so_far = raw_sales[:i]
        feats = construct_features_for_series(history_so_far, target_date, mock_events)
        X_data.append([feats[col] for col in FEATURE_COLUMNS])
        y_data.append(raw_sales[i])

    return np.array(X_data), np.array(y_data)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

def load_or_generate_dataset():
    """
    Checks for user-provided CSV dataset first in data/ directory;
    falls back to simulated campus academic time-series.
    """
    candidate_files = [
        os.path.join(DATA_DIR, 'custom_sales_data.csv'),
        os.path.join(DATA_DIR, 'sample_campus_sales.csv'),
    ]

    for csv_file in candidate_files:
        if os.path.exists(csv_file):
            print(f"[ML Pipeline] Loading training dataset from CSV: {csv_file}")
            df = pd.read_csv(csv_file)
            if 'date' in df.columns and 'daily_sales' in df.columns:
                df['date'] = pd.to_datetime(df['date'])
                df = df.sort_values('date')

                # Pre-aggregate distinct academic events once across the dataset
                distinct_events = []
                if 'academic_event' in df.columns:
                    for ev_name in ['MID_TERM_EXAMS', 'END_SEM', 'SEMESTER_START', 'PROJECT_SUBMISSION']:
                        sub = df[df['academic_event'] == ev_name]
                        if not sub.empty:
                            for (year, month), grp in sub.groupby([sub['date'].dt.year, sub['date'].dt.month]):
                                distinct_events.append({
                                    'title': ev_name,
                                    'type': ev_name,
                                    'start_date': grp['date'].min().strftime('%Y-%m-%d'),
                                    'end_date': grp['date'].max().strftime('%Y-%m-%d')
                                })

                if 'product_sku' in df.columns:
                    X_all, y_all = [], []
                    for sku, group in df.groupby('product_sku'):
                        group = group.sort_values('date').reset_index(drop=True)
                        sales = group['daily_sales'].tolist()
                        dates = group['date'].tolist()

                        for i in range(15, len(sales)):
                            feats = construct_features_for_series(sales[:i], dates[i], distinct_events)
                            X_all.append([feats[col] for col in FEATURE_COLUMNS])
                            y_all.append(sales[i])

                    if len(X_all) >= 50:
                        print(f"[ML Pipeline] Successfully extracted {len(X_all)} training instances from {csv_file}")
                        return np.array(X_all), np.array(y_all)
                else:
                    sales = df['daily_sales'].tolist()
                    dates = df['date'].tolist()
                    X_data, y_data = [], []
                    for i in range(15, len(sales)):
                        feats = construct_features_for_series(sales[:i], dates[i], [])
                        X_data.append([feats[col] for col in FEATURE_COLUMNS])
                        y_data.append(sales[i])
                    return np.array(X_data), np.array(y_data)

    print("[ML Pipeline] No custom CSV found. Generating synthetic academic time-series...")
    return generate_training_dataset(days_history=150)

def train_and_select_model():
    X, y = load_or_generate_dataset()
    split_idx = int(len(X) * 0.8) # Time-ordered split (no shuffle!)

    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]

    # Seasonal naive baseline: lag_7 (same day last week)
    lag_7_col_idx = FEATURE_COLUMNS.index('lag_7')
    baseline_preds = X_val[:, lag_7_col_idx]
    baseline_eval = evaluate_predictions(y_val, baseline_preds)

    # Candidate 1: RandomForestRegressor
    rf = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    rf.fit(X_train, y_train)
    rf_preds = np.maximum(0, rf.predict(X_val))
    rf_metrics = evaluate_predictions(y_val, rf_preds, baseline=baseline_preds)

    # Candidate 2: HistGradientBoostingRegressor
    hgb = HistGradientBoostingRegressor(max_iter=100, max_depth=6, random_state=42)
    hgb.fit(X_train, y_train)
    hgb_preds = np.maximum(0, hgb.predict(X_val))
    hgb_metrics = evaluate_predictions(y_val, hgb_preds, baseline=baseline_preds)

    # Select best model based on MAE
    if rf_metrics['mae'] <= hgb_metrics['mae']:
        best_model = rf
        best_name = 'RandomForestRegressor'
        best_metrics = rf_metrics
    else:
        best_model = hgb
        best_name = 'HistGradientBoostingRegressor'
        best_metrics = hgb_metrics

    # Retrain best architecture on full dataset
    best_model.fit(X, y)

    # Save artifact
    joblib.dump(best_model, MODEL_FILE)

    report = {
        'model_name': best_name,
        'model_version': '1.0.0',
        'trained_at': datetime.now().isoformat(),
        'validation_strategy': 'Time-ordered walk-forward holdout (80/20)',
        'mae': best_metrics['mae'],
        'rmse': best_metrics['rmse'],
        'wape': best_metrics['wape'],
        'baseline_mae': baseline_eval['mae'],
        'features_used': FEATURE_COLUMNS,
    }

    with open(METRICS_FILE, 'w') as f:
        json.dump(report, f, indent=2)

    return report

if __name__ == '__main__':
    rep = train_and_select_model()
    print("Training finished:", rep)
