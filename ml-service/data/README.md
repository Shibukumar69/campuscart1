# CampusCart AI — Dataset Guide & Format Specifications

This directory (`ml-service/data/`) holds training datasets used by the Machine Learning demand forecasting engine.

---

## 1. Real-World Datasets Included

CampusCart AI now uses **100% real-world transactional retail data** (no dummy data):

1. **`real_superstore_raw.csv`** (9,994 raw transactions):
   - Authentic, benchmark real-world retail transactions dataset.
   - Includes actual customer transactions across Office Supplies, Furniture, and Tech.

2. **`real_stationery_daily_demand.csv`** (11,664 daily records / 1,458 days):
   - Extracted directly from 6,026 real office supplies & stationery transactions (Binders, Paper, Art supplies, Storage, Labels, Envelopes, Fasteners, Appliances/Calculators).
   - Real continuous time-series covering 4 full consecutive years with authentic customer buying patterns and seasonal trends.

3. **`sample_campus_sales.csv`**:
   - Active default training dataset loaded by the ML pipeline.

---

## 2. Required Columns & Data Dictionary

Your CSV should contain the following columns:

| Column Name | Data Type | Example Value | Description |
|---|---|---|---|
| `date` | String (`YYYY-MM-DD`) | `2026-03-15` | The date of recorded sales |
| `product_sku` | String | `NB-CLS-L120` | Unique Product SKU / Code |
| `product_name` | String | `Classmate Notebook` | Name of the stationery product |
| `daily_sales` | Integer / Float | `24` | Quantity sold on that date (Target $y$) |
| `academic_event` | String (Optional) | `MID_TERM_EXAMS` | `REGULAR_CLASSES`, `MID_TERM_EXAMS`, `PROJECT_SUBMISSION`, `END_SEM` |
| `is_weekend` | Integer (0 or 1) | `0` | 1 if Saturday or Sunday, else 0 |

---

## 3. How to Train the Model on Your Custom Dataset

### Option A: Command Line Training
Run the training script directly from the `ml-service` directory:
```bash
cd ml-service
.\venv\Scripts\python.exe -m app.train
```

### Option B: Via CampusCart AI Web Dashboard
1. Log in as **Shop Owner** (`vendor@campuscart.edu`) or **Admin** (`admin@campuscart.edu`).
2. Go to **AI Demand Forecasting** (`http://localhost:5173/vendor/forecasting`).
3. Click the **"Retrain AI Model"** button. The microservice will automatically reload the latest data, compute temporal features (`lag_1` to `lag_14`, `rolling_mean_7`, exam shocks), and deploy the updated model in `artifacts/demand_model.joblib`.
