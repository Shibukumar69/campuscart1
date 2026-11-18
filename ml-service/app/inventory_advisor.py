import math
from typing import Dict, Any, List

def calculate_inventory_advice(
    current_stock: int,
    lead_time_days: int,
    safety_stock: int,
    daily_predictions: List[Dict[str, Any]],
    replenishment_cycle_days: int = 14
) -> Dict[str, Any]:
    """
    Computes stock health, lead-time demand, stockout risk, and suggested reorder quantities.
    """
    horizon = len(daily_predictions)
    total_forecast_demand = sum(p['predicted_units'] for p in daily_predictions)

    # Lead time demand = average daily demand * lead_time_days
    avg_daily_demand = total_forecast_demand / max(1, horizon)
    lead_time_demand = math.ceil(avg_daily_demand * lead_time_days)

    # Reorder Point = Expected Demand During Lead Time + Safety Stock
    reorder_point = lead_time_demand + safety_stock

    # Estimated days until stock runs out
    accumulated = 0
    days_of_stock_left = 999
    stockout_date = None

    for i, pt in enumerate(daily_predictions):
        accumulated += pt['predicted_units']
        if accumulated >= current_stock and stockout_date is None:
            days_of_stock_left = i + 1
            stockout_date = pt['date']

    # Stockout risk assessment
    if current_stock == 0:
        stockout_risk = 'CRITICAL'
    elif current_stock <= safety_stock or days_of_stock_left <= lead_time_days:
        stockout_risk = 'HIGH'
    elif current_stock <= reorder_point:
        stockout_risk = 'MEDIUM'
    else:
        stockout_risk = 'LOW'

    # Replenishment cycle demand
    cycle_demand = math.ceil(avg_daily_demand * replenishment_cycle_days)
    # Suggested purchase = max(0, cycle_demand + safety_stock - current_stock)
    suggested_qty = max(0, cycle_demand + safety_stock - current_stock)

    spike_alert = any(p['predicted_units'] >= (avg_daily_demand * 1.5) for p in daily_predictions)

    return {
        'total_forecast_demand': total_forecast_demand,
        'lead_time_demand': lead_time_demand,
        'reorder_point': reorder_point,
        'days_of_stock_left': days_of_stock_left,
        'stockout_date': stockout_date,
        'stockout_risk': stockout_risk,
        'suggested_reorder_quantity': suggested_qty,
        'spike_alert': spike_alert,
        'reorder_needed': current_stock <= reorder_point,
    }
