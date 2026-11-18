# CampusCart AI — Machine Learning Methodology

## 1. Problem Formulation

The CampusCart AI Machine Learning microservice predicts future daily demand ($y_t$) for each stationery product at each campus vendor.
Demand patterns are heavily non-linear and exhibit:
- **Weekly seasonality**: Sharp weekend dips and weekday surges.
- **Academic event shocks**: Mid-terms, practical records, and final project report submissions create demand spikes up to 3x higher than average daily consumption.
- **Stockout censorship**: Sales observed during stockouts reflect constrained supply rather than true latent demand.

---

## 2. Feature Engineering Pipeline

Features are generated dynamically with zero future-data leakage:

| Feature Name | Description | Purpose |
| :--- | :--- | :--- |
| `lag_1`, `lag_2`, `lag_3` | Recent 1, 2, 3 day sales | Immediate autoregressive momentum |
| `lag_7`, `lag_14` | Same day previous week/fortnight | Weekly seasonal autocorrelation |
| `rolling_mean_7` | 7-day trailing average | Central tendency smoothing |
| `rolling_std_7` | 7-day trailing standard deviation | Volatility & demand dispersion |
| `day_of_week`, `is_weekend` | Calendar indicators | Day-of-week consumption shifts |
| `days_to_next_exam` | Days until upcoming examination | Anticipatory exam surge detection |
| `is_exam_period` | Active exam week binary | Current examination period indicator |
| `days_to_project_deadline` | Days until major report submission | Xerox & binding demand spike trigger |
| `recent_demand_growth` | $(\text{mean}_3 - \text{mean}_7) / \text{mean}_7$ | Growth velocity acceleration signal |

---

## 3. Walk-Forward Validation & Model Selection

- **Split Strategy**: Strictly time-ordered walk-forward holdout (80% training / 20% validation). Random K-Fold splitting is strictly prohibited to prevent temporal leakage.
- **Evaluated Models**:
  1. *Seasonal Naive Baseline*: $\hat{y}_t = y_{t-7}$ (MAE: 1.444)
  2. *HistGradientBoostingRegressor*
  3. *RandomForestRegressor* (Selected: MAE: 1.357, RMSE: 1.787, WAPE: 20.94%)

---

## 4. Intelligent Inventory Advisory Formulation

The advisory system translates predicted demand into actionable purchase recommendations:

### Reorder Point (ROP)
$$\text{Reorder Point} = \text{Lead Time Demand} + \text{Safety Stock}$$
$$\text{Lead Time Demand} = \left(\frac{1}{H}\sum_{t=1}^H \hat{y}_t\right) \times L$$

### Suggested Purchase Quantity
$$\text{Suggested PO Quantity} = \max\left(0, \text{Cycle Demand} + \text{Safety Stock} - \text{Current Stock}\right)$$

Where $L$ is vendor supplier replenishment lead-time in days, $H$ is the forecasting horizon (7 or 30 days), and cycle demand is the expected consumption across a 14-day replenishment window.
