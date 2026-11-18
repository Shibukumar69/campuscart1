import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any

FEATURE_COLUMNS = [
    'lag_1', 'lag_2', 'lag_3', 'lag_7', 'lag_14',
    'rolling_mean_7', 'rolling_mean_14', 'rolling_std_7',
    'day_of_week', 'day_of_month', 'month', 'is_weekend',
    'days_to_next_exam', 'is_exam_period', 'days_to_project_deadline',
    'recent_demand_growth'
]

def parse_date(date_str: str) -> datetime:
    return datetime.strptime(date_str[:10], '%Y-%m-%d')

def compute_academic_event_features(current_date: datetime, events: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Computes time-distance and proximity features to upcoming exams and project deadlines.
    Strictly uses information on or after current_date to avoid future-sales data leakage.
    """
    min_days_to_exam = 999.0
    is_exam_today = 0.0
    min_days_to_project = 999.0

    for ev in events:
        s_date = parse_date(ev['start_date'] if isinstance(ev, dict) else ev.start_date)
        e_date = parse_date(ev['end_date'] if isinstance(ev, dict) else ev.end_date)
        e_type = ev['type'] if isinstance(ev, dict) else ev.type

        # Check if today falls in exam window
        if s_date <= current_date <= e_date:
            if 'EXAM' in e_type or 'ASSESSMENT' in e_type:
                is_exam_today = 1.0

        # Distance to upcoming exam
        if s_date >= current_date:
            delta_days = (s_date - current_date).days
            if 'EXAM' in e_type or 'ASSESSMENT' in e_type:
                if delta_days < min_days_to_exam:
                    min_days_to_exam = float(delta_days)
            elif 'PROJECT' in e_type:
                if delta_days < min_days_to_project:
                    min_days_to_project = float(delta_days)

    return {
        'days_to_next_exam': min(min_days_to_exam, 30.0),
        'is_exam_period': is_exam_today,
        'days_to_project_deadline': min(min_days_to_project, 30.0),
    }

def construct_features_for_series(sales_series: List[float], target_date: datetime, academic_events: List[Any]) -> Dict[str, float]:
    """
    Constructs the exact feature dictionary for a single step in time.
    sales_series: ordered history ending at target_date - 1 day (yesterday).
    """
    history_len = len(sales_series)
    
    # Safe retrieval of lags
    def get_lag(n):
        return float(sales_series[-n]) if history_len >= n else (float(sales_series[-1]) if history_len > 0 else 5.0)

    lag_1 = get_lag(1)
    lag_2 = get_lag(2)
    lag_3 = get_lag(3)
    lag_7 = get_lag(7)
    lag_14 = get_lag(14)

    # Rolling calculations
    r7 = sales_series[-7:] if history_len >= 7 else sales_series
    r14 = sales_series[-14:] if history_len >= 14 else sales_series

    rolling_mean_7 = float(np.mean(r7)) if len(r7) > 0 else 5.0
    rolling_mean_14 = float(np.mean(r14)) if len(r14) > 0 else rolling_mean_7
    rolling_std_7 = float(np.std(r7)) if len(r7) > 1 else 1.0

    day_of_week = float(target_date.weekday()) # 0=Mon, 6=Sun
    day_of_month = float(target_date.day)
    month = float(target_date.month)
    is_weekend = 1.0 if day_of_week in [5, 6] else 0.0

    # Growth ratio (recent 3 days vs preceding 7 days)
    r3 = sales_series[-3:] if history_len >= 3 else [lag_1]
    mean_3 = np.mean(r3) if len(r3) > 0 else rolling_mean_7
    recent_growth = float((mean_3 - rolling_mean_7) / (rolling_mean_7 + 1e-4))

    # Academic features
    academic_feats = compute_academic_event_features(target_date, academic_events)

    return {
        'lag_1': lag_1,
        'lag_2': lag_2,
        'lag_3': lag_3,
        'lag_7': lag_7,
        'lag_14': lag_14,
        'rolling_mean_7': rolling_mean_7,
        'rolling_mean_14': rolling_mean_14,
        'rolling_std_7': rolling_std_7,
        'day_of_week': day_of_week,
        'day_of_month': day_of_month,
        'month': month,
        'is_weekend': is_weekend,
        'days_to_next_exam': academic_feats['days_to_next_exam'],
        'is_exam_period': academic_feats['is_exam_period'],
        'days_to_project_deadline': academic_feats['days_to_project_deadline'],
        'recent_demand_growth': max(-1.0, min(1.0, recent_growth)),
    }
