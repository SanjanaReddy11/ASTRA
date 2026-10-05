# ASTRA — Satellite Conjunction Risk System

ASTRA is a machine-learning early-warning and risk-assessment system for
satellite conjunctions. It combines a FastAPI backend with a React-based
mission-control frontend and a trained CatBoost regression model.

## Project Structure

```text
astra-full/
├── backend/
│   ├── main.py
│   ├── predict.py
│   ├── requirements.txt
│   └── model/
│       ├── catboost_risk_model.cbm
│       └── selected_features.json
│
└── frontend/
    ├── src/
    │   └── app/
    │       ├── components/
    │       ├── pages/
    │       └── services/
    ├── package.json
    └── vite.config.ts
```

The actual folder name on an individual computer may be different. The
repository does not depend on a specific local folder name.

## System Overview

ASTRA processes structured Conjunction Data Message (CDM) data and uses a
trained `CatBoostRegressor` to estimate continuous satellite conjunction risk.

The main prediction flow is:

```text
CSV / XLSX Dataset
        ↓
Frontend Upload
        ↓
FastAPI Backend
        ↓
Data Validation & Preprocessing
        ↓
CatBoostRegressor
        ↓
Predicted log10 Collision Risk
        ↓
Risk Classification
        ↓
Low / Medium / High
```

The frontend communicates with the backend through the prediction API.

## Machine-Learning Model

The deployed model is:

```text
CatBoostRegressor
```

The model is stored in CatBoost's native format:

```text
backend/model/catboost_risk_model.cbm
```

The expected feature schema is stored in:

```text
backend/model/selected_features.json
```

The deployed model schema contains **104 features**.

The categorical feature is:

```text
c_object_type
```

CatBoost handles this categorical feature natively.

The original raw train/test datasets contain **103 columns**. The deployed
model schema also contains four additional numeric missingness-indicator
features:

```text
covariance_missing
t_rcs_missing
c_rcs_missing
space_weather_missing
```

These fields may be absent from raw uploaded datasets. When they are absent,
the backend passes them as missing numeric values (`NaN`), which CatBoost can
handle natively.

## Model Output

The model predicts a continuous:

```text
log10(probability of collision)
```

The backend converts this continuous prediction into:

- predicted log10 collision risk
- collision probability
- Low / Medium / High risk classification
- 0–100 display risk score
- high-risk alert status

The 0–100 risk score is a display-oriented risk scale. It is **not model
confidence** and should not be interpreted as prediction accuracy.

The configured classification thresholds are:

```text
Low:       log10(Pc) <= -20
Medium:    -20 < log10(Pc) <= -12
High:      log10(Pc) > -12
```

## Model Validation

The current project evaluation reports the following regression metrics:

| Metric | Result |
|---|---:|
| R² | **0.766** |
| MAE | **3.20** |
| RMSE | **4.78** |

For the configured risk-tier classification:

| Metric | Result |
|---|---:|
| Accuracy | **85.48%** |
| Weighted Precision | **87.62%** |
| Weighted Recall | **85.48%** |
| Weighted F1 | **86.06%** |
| High-risk Recall | **77.96%** |

### Metric interpretation

- **R²** measures the proportion of variance in the target explained by the
  model.
- **MAE** measures the average absolute prediction error.
- **RMSE** penalizes larger prediction errors more strongly than MAE.
- **High-risk recall** measures how many actual high-risk cases are identified
  by the classification system.
- **Weighted F1** summarizes precision and recall across the risk classes while
  accounting for class frequency.

These metrics describe model evaluation performance. They are not the
probability that an individual prediction is correct.

## Future-Risk Evaluation

ASTRA also evaluates future conjunction risk using subsequent Conjunction
Data Messages (CDMs).

### +1 CDM

For the strict +1 CDM future-risk evaluation:

| Metric | Result |
|---|---:|
| R² | **0.844** |
| MAE | **2.04** |
| RMSE | **3.92** |

### +2 CDMs

For the strict +2 CDM future-risk evaluation:

| Metric | Result |
|---|---:|
| R² | **0.766** |
| MAE | **2.98** |
| RMSE | **4.78** |

Future-risk prediction evaluates whether an earlier CDM can be used to estimate
the risk associated with a later conjunction state.

## Early-Warning Evaluation

The project separately evaluates whether a high-risk event can be identified
before its first observed high-risk CDM.

Current strict validation results:

- Actual high-risk events: **1,621**
- Events with an earlier high-risk prediction: **27**
- Early-warning rate: **1.67%**
- Mean lead: **1.74 CDMs**
- Median lead: **1 CDM**
- Maximum lead: **10 CDMs**

Future-risk prediction performance and strict early-warning performance are
different measures. A model can estimate future risk reasonably well without
necessarily producing a high-risk alert several CDMs before the first
high-risk observation.

## Backend API

The backend is implemented using:

```text
FastAPI
Python
Pandas
CatBoost
Uvicorn
```

### Health endpoint

```text
GET /
```

The endpoint reports whether the backend is online and whether the model is
loaded.

Example:

```json
{
  "project": "Astra SDC-II",
  "status": "Online",
  "model_loaded": true,
  "mode": "Live Model"
}
```

### JSON prediction

```text
POST /predict/json
```

Accepts a JSON object containing the model input features.

### Tabular prediction

```text
POST /predict/tabular
```

Accepts:

```text
.csv
.xlsx
```

files and processes the uploaded data on the backend.

This is the endpoint used by the frontend Upload workflow.

## Frontend

The frontend is implemented using React and TanStack Start tooling.

Main application sections include:

- Dashboard
- Mission Overview
- Predictions
- Alerts
- CDM Upload
- Analytics
- Reports
- Activity & Audit History
- Timeline
- Settings
- Help

The frontend also supports:

- Dark theme
- Light theme
- Theme persistence
- Command palette
- Local application state
- Report generation
- Activity and audit history

## Upload Workflow

The CDM Upload page accepts structured tabular data.

Supported formats:

```text
.csv
.xlsx
```

The workflow is:

```text
Dataset Upload
      ↓
Data Ingestion
      ↓
Data Validation
      ↓
Data Preprocessing
      ↓
Future-Risk Prediction
      ↓
Risk Classification
      ↓
Prediction Result
```

The prediction itself is performed by the live FastAPI/CatBoost backend.

The frontend does not perform the CatBoost prediction locally.

## Unsupported Formats

The current prediction model does not support:

```text
PDF
DOCX
JPG
PNG
```

The CatBoost model operates on structured orbital/conjunction data rather than
image data.

Supporting image-based prediction would require a separate trained computer
vision model.

PDF or DOCX support would require a dedicated parser for a known document
format containing the required model features.

## Running Locally

### Prerequisites

Install:

- Python 3
- Node.js
- npm

### Backend

From the project root:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend will run at:

```text
http://127.0.0.1:8000
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite.

The frontend uses the local backend by default.

## Backend API Configuration

The frontend API base URL can be configured using:

```text
VITE_API_BASE_URL
```

For example:

```text
VITE_API_BASE_URL=https://your-backend-url
```

For local development, the default backend URL is:

```text
http://localhost:8000
```

Do not commit a local `.env` file containing machine-specific or secret
configuration.

## Building the Frontend

From the frontend directory:

```bash
npm run build
```

For a TypeScript check:

```bash
npx tsc --noEmit
```

Both commands should complete successfully before a release.

## Model Files Required for Deployment

The following files are required by the backend:

```text
backend/model/catboost_risk_model.cbm
backend/model/selected_features.json
```

These files must be included in the Git repository or deployment artifact.

The Python virtual environment itself should **not** be committed.

Dependencies are recreated from:

```text
backend/requirements.txt
```

## Portability

The project is intended to be runnable on different developer laptops.

The repository should not depend on:

- absolute paths from a developer's computer
- a developer's Python virtual environment
- a developer's `node_modules`
- local `.env` files
- temporary prediction output files
- local test datasets
- Python cache files
- frontend build output

A new developer should be able to clone the repository, install the backend
and frontend dependencies, and start the two services using the commands in
this README.

## Deployment

### Backend

The backend can be deployed to any service capable of running Python and
Uvicorn.

The deployment must include:

```text
backend/model/catboost_risk_model.cbm
backend/model/selected_features.json
```

### Frontend

Build the frontend with:

```bash
npm run build
```

Configure the deployed backend URL through:

```text
VITE_API_BASE_URL
```

The backend's CORS configuration should be restricted to the deployed
frontend domain for a production deployment.

## Release Verification Checklist

Before creating a release, verify the following.

### Frontend

- ASTRA branding is consistent.
- Dark theme works correctly.
- Light theme works correctly.
- Dark ↔ Light switching works correctly.
- Theme remains correct after refresh.
- Login works.
- Dashboard loads.
- Mission Overview loads.
- Predictions loads.
- Alerts loads.
- CDM Upload loads.
- CSV upload works.
- XLSX upload works.
- Analytics loads.
- Reports loads.
- PDF report generation works.
- History loads.
- Timeline loads.
- Settings loads.
- Help loads.

### Backend

- FastAPI starts successfully.
- Health endpoint responds.
- `model_loaded` is `true`.
- `mode` is `Live Model`.
- CatBoost model loads successfully.
- `/predict/json` responds correctly.
- `/predict/tabular` accepts a valid CSV/XLSX file.
- A valid upload produces a real CatBoost prediction.

### Build

Run:

```bash
npx tsc --noEmit
npm run build
```

Both commands should complete without errors.

### Portability

Before pushing the base version:

- Do not commit `venv/`.
- Do not commit `node_modules/`.
- Do not commit `__pycache__/`.
- Do not commit `.pyc` files.
- Do not commit `dist/`.
- Do not commit local `.env` files.
- Do not commit temporary prediction responses.
- Do not commit large local test datasets unless intentionally required.
- Verify that the model `.cbm` and `selected_features.json` are included.
- Verify that `requirements.txt` and `package.json` are included.
- Verify that the project works after installing dependencies on a clean
  machine.

## Important Model Metrics

The current documented CatBoost evaluation results are:

```text
R²                 0.766
MAE                3.20
RMSE               4.78
High-risk Recall   77.96%
Weighted F1        86.06%
```

These values should only be changed when a new model or evaluation pipeline
has been formally evaluated and documented.