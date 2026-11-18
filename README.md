# CampusCart AI 🎓🛒
### Smart Student Stationery Delivery System Using Demand Prediction & Intelligent Inventory Management (MERN + Machine Learning)

[![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Active-green.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Project Overview & Vision

**CampusCart AI** is a full-stack, machine-learning-integrated campus commerce platform designed for college universities. It unites student stationery ordering, automated PDF document printing/xerox services, hostel door delivery with 6-digit OTP verification, and **AI-powered demand forecasting** to help campus vendors maintain optimal inventory levels.

### The Problem It Solves
- **Student Exam Out-of-Stock Crises**: Every semester, college bookstores unexpectedly run out of blue pens, practical record sheets, graph paper, and scientific calculators during exam weeks.
- **Xerox Shop Queue Congestion**: Students wait in chaotic lines before assignment deadlines to submit flash drives.
- **Blind Shop Inventory Purchases**: Vendors guess inventory quantities without correlating upcoming examination calendars or past sales momentum.

### The Innovation
CampusCart AI incorporates an **Academic-Calendar-Aware Machine Learning Microservice** (FastAPI + scikit-learn). The model dynamically ingests past sales, day-of-week consumption shifts, and university exam dates to provide 7-day and 30-day daily demand trajectories and calculate exact replenishment purchase quantities using documented inventory formulas.

---

## 2. Technology Stack

### Frontend (`client/`)
- **React.js 18** with **Vite 6**
- **Tailwind CSS** (curated color palettes, light & dark theme modes)
- **Lucide React** consistent iconography
- **Recharts** interactive forecasting charts with confidence bands
- **Sonner** toast notifications
- **Axios** with automatic JWT Bearer token interceptor
- **React Router DOM 6** with role-based routing guards

### Backend REST API (`server/`)
- **Node.js** & **Express.js** (Layered architecture: Controllers, Services, Models, Routes)
- **MongoDB** & **Mongoose ODM** with compound indexes
- **JWT** authentication with rotating Refresh Tokens
- **bcryptjs** password hashing
- **Multer** secure private PDF file upload handling
- **Helmet**, **CORS**, and **express-rate-limit** security suite

### Machine Learning Microservice (`ml-service/`)
- **Python 3.12** & **FastAPI**
- **Pandas** & **NumPy**
- **scikit-learn** (RandomForestRegressor & HistGradientBoostingRegressor)
- **Joblib** model artifact serialization
- **Pytest** time-series test suite

---

## 3. User Roles & Features

| Role | Core Capabilities |
| :--- | :--- |
| **Student** | Browse stationery marketplace, filter by categories, add to cart, choose Hostel Delivery vs Counter Pickup, track orders, view **6-digit delivery OTP**, submit PDF documents for printing (duplex/color/spiral binding) with live price calculator. |
| **Shop Owner** | Product management, live **Green/Amber/Red stock health indicators**, auditable **Inventory Ledger**, **AI Demand Forecasting Dashboard** (7/30 days), **Reorder Recommendations**, 1-click **Draft Purchase Order Generator**, print queue management. |
| **Delivery Agent** | Mobile-friendly courier terminal, view pickup store and destination hostel room numbers, start deliveries, **verify student 6-digit OTP** to complete handovers. |
| **Administrator** | Gross Merchandise Value (GMV) and platform commission (5%) tracking, user directory with suspension controls, vendor approval workflow, **Academic Calendar Manager** (exam dates feed directly into ML features), audit logs. |

---

## 4. Machine Learning & Inventory Methodology

### Feature Engineering
Features are engineered strictly without temporal leakage:
- `lag_1`, `lag_2`, `lag_3`, `lag_7`, `lag_14` (autoregressive momentum)
- `rolling_mean_7`, `rolling_mean_14`, `rolling_std_7` (trend smoothing & dispersion)
- `day_of_week`, `is_weekend` (weekly seasonality)
- `days_to_next_exam`, `is_exam_period` (examination proximity signals)
- `days_to_project_deadline` (document printing surge triggers)
- `recent_demand_growth` (growth acceleration ratio)

### Evaluation Metrics
Evaluated using time-ordered walk-forward holdout validation (80/20 train/test split without shuffle):
- **Selected Model**: `RandomForestRegressor`
- **Mean Absolute Error (MAE)**: `1.357` (beats Seasonal Baseline MAE: `1.444`)
- **Root Mean Squared Error (RMSE)**: `1.787`
- **Weighted Absolute Percentage Error (WAPE)**: `20.94%`

### Documented Inventory Formula
$$\text{Reorder Point} = \text{Expected Lead Time Demand} + \text{Safety Stock}$$
$$\text{Suggested PO Quantity} = \max(0, \text{Replenishment Cycle Demand} + \text{Safety Stock} - \text{Current Usable Stock})$$

---

## 5. Quick Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB running on `127.0.0.1:27017`

### Step 1: Install Dependencies
```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install

# Setup Python ML Virtual Environment
cd ../ml-service
python -m venv venv
./venv/Scripts/python -m pip install --upgrade pip
./venv/Scripts/pip install -r requirements.txt
```

### Step 2: Seed the Database
Populates all 4 user roles, 2 campus shops, stationery categories, 30+ products, inventory ledgers, academic calendar events, and 45 days of sales records:
```bash
cd server
npm run seed
```

### Step 3: Run Microservices
In separate terminal windows:

**Terminal 1 — Machine Learning Service (FastAPI)**:
```bash
cd ml-service
./venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

**Terminal 2 — Backend API (Express.js)**:
```bash
cd server
npm run dev
```

**Terminal 3 — Frontend Web App (React + Vite)**:
```bash
cd client
npm run dev
```

The application is accessible at: **`http://localhost:5173`**

---

## 6. Demo Evaluation Credentials

Use the **1-Click Demo Login Buttons** on the Login screen, or enter credentials manually:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@campuscart.edu` | `Campus@123` |
| **Shop Owner** | `vendor@campuscart.edu` | `Campus@123` |
| **Delivery Courier**| `delivery@campuscart.edu` | `Campus@123` |
| **Administrator** | `admin@campuscart.edu` | `Campus@123` |

---

## 7. Running Quality Assurance Tests

### Backend Unit Tests
```bash
cd server
npm test
```
*Validates print pricing engine (duplex/simplex/color/binding calculations) and delivery OTP SHA-256 hash security.*

### Machine Learning Unit Tests
```bash
cd ml-service
./venv/Scripts/pytest
```
*Validates zero feature leakage, non-negative predictions, 7/30 day recursive multi-horizon projections, cold-start handling, and reorder point formulas.*

### Client Production Bundle Build Check
```bash
cd client
npm run build
```
*Confirms 0 bundle errors, syntax issues, or broken imports.*

---

## 8. Directory Structure

```text
campuscart1/
├── client/                     # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/         # Common, Layout, and UI components
│   │   ├── context/            # AuthContext, CartContext, ThemeContext
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Student Registration
│   │   │   ├── public/         # LandingPage, Marketplace, About, HowItWorks
│   │   │   ├── student/        # StudentDashboard, Cart, Checkout, MyOrders, Printing
│   │   │   ├── vendor/         # VendorDashboard, Products, Inventory, Forecasting, POs
│   │   │   ├── delivery/       # DeliveryDashboard, OTP Verification
│   │   │   └── admin/          # AdminDashboard, Users, Calendar, Approvals, Audit
│   │   ├── routes/             # AppRoutes with RBAC protected route wrappers
│   │   └── services/           # Axios API client with bearer token injection
│   └── package.json
│
├── server/                     # Express REST API & MongoDB Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection
│   │   ├── controllers/        # Business logic controllers
│   │   ├── middleware/         # Auth, RBAC, Multer, Error Handlers
│   │   ├── models/             # Mongoose Schemas (User, Shop, Product, Order, etc.)
│   │   ├── routes/             # Express API Route handlers
│   │   ├── scripts/            # Database seed script
│   │   ├── tests/              # Jest test suites
│   │   └── utils/              # Pricing engine, token utilities
│   └── package.json
│
├── ml-service/                 # Python 3 FastAPI Machine Learning Service
│   ├── app/
│   │   ├── main.py             # FastAPI entry with CORS and endpoints
│   │   ├── features.py         # Feature engineering without leakage
│   │   ├── train.py            # Estimator comparison & model training
│   │   ├── predict.py          # 7/30-day recursive demand forecasting
│   │   ├── inventory_advisor.py# Safety stock and reorder point calculations
│   │   └── evaluation.py       # MAE, RMSE, WAPE metric evaluator
│   ├── tests/                  # Pytest verification suite
│   ├── artifacts/              # Serialized joblib model & metrics.json
│   └── requirements.txt
│
├── docs/                       # Project documentation
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── database-design.md
│   └── ml-methodology.md
│
└── README.md
```

---

## 9. License

This project is licensed under the MIT License — created for university campus commerce optimization and machine learning demand forecasting research.
