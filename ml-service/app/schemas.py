from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AcademicEventSchema(BaseModel):
    title: str
    type: str
    start_date: str
    end_date: str
    impact_category: Optional[str] = 'GENERAL'

class DailySaleRecord(BaseModel):
    date: str
    quantity: float

class PredictRequest(BaseModel):
    shop_id: str
    product_id: str
    product_name: str
    category: Optional[str] = 'General'
    current_stock: int = 0
    lead_time_days: int = 2
    safety_stock: int = 10
    horizon_days: int = Field(default=7, ge=1, le=60)
    historical_sales: Optional[List[DailySaleRecord]] = []
    academic_events: Optional[List[AcademicEventSchema]] = []

class DailyForecastPoint(BaseModel):
    date: str
    day_name: str
    predicted_units: int
    lower_bound: int
    upper_bound: int

class PredictResponse(BaseModel):
    product_id: str
    product_name: str
    current_stock: int
    lead_time_days: int
    safety_stock: int
    horizon_days: int
    predictions: List[DailyForecastPoint]
    total_predicted_demand: int
    lead_time_demand: int
    reorder_point: int
    stockout_risk: str # 'LOW', 'MEDIUM', 'HIGH'
    suggested_reorder_quantity: int
    model_version: str
    data_status: str # 'historical' or 'cold_start_baseline'
    limitations: List[str] = []

class ModelMetricsResponse(BaseModel):
    model_name: str
    model_version: str
    trained_at: str
    validation_strategy: str
    mae: float
    rmse: float
    wape: float
    baseline_mae: float
    features_used: List[str]
