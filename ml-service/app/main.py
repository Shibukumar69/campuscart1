import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.schemas import PredictRequest, PredictResponse, ModelMetricsResponse
from app.predict import forecast_demand, MODEL_FILE
from app.train import train_and_select_model, METRICS_FILE

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-train if model doesn't exist yet
    if not os.path.exists(MODEL_FILE):
        print("[ML Startup] No trained model artifact found. Running initial training pipeline...")
        train_and_select_model()
    yield

app = FastAPI(
    title="CampusCart AI — Demand Prediction & Inventory Advisor Service",
    description="FastAPI Machine Learning microservice for student stationery demand forecasting and safety-stock recommendations.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    has_model = os.path.exists(MODEL_FILE)
    return {
        "status": "ok",
        "service": "CampusCart AI ML Service",
        "model_loaded": has_model,
        "version": "1.0.0",
    }

@app.post("/train", response_model=ModelMetricsResponse)
def train_model():
    try:
        report = train_and_select_model()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training pipeline error: {str(e)}")

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    try:
        res = forecast_demand(
            product_id=request.product_id,
            product_name=request.product_name,
            current_stock=request.current_stock,
            lead_time_days=request.lead_time_days,
            safety_stock=request.safety_stock,
            horizon_days=request.horizon_days,
            historical_sales=request.historical_sales,
            academic_events=request.academic_events,
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/batch", response_model=List[PredictResponse])
def predict_batch(requests: List[PredictRequest]):
    results = []
    for req in requests:
        res = forecast_demand(
            product_id=req.product_id,
            product_name=req.product_name,
            current_stock=req.current_stock,
            lead_time_days=req.lead_time_days,
            safety_stock=req.safety_stock,
            horizon_days=req.horizon_days,
            historical_sales=req.historical_sales,
            academic_events=req.academic_events,
        )
        results.append(res)
    return results

@app.get("/model/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    if not os.path.exists(METRICS_FILE):
        report = train_and_select_model()
        return report
    with open(METRICS_FILE, 'r') as f:
        metrics = json.load(f)
    return metrics
