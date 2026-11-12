import os
import json
import io
from typing import Dict, Any

import numpy as np
import pandas as pd


# ============================================================
# PATHS TO MODEL FILES
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "catboost_risk_model.cbm",
)

FEATURES_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "selected_features.json",
)


# ============================================================
# FEATURE CONFIGURATION
# ============================================================

# These four features are allowed to be absent from raw uploads.
# When absent, they are passed to CatBoost as NaN.

OPTIONAL_FEATURES = {
    "covariance_missing",
    "t_rcs_missing",
    "c_rcs_missing",
    "space_weather_missing",
}


# Global model variables

loaded_model = None
selected_features = None
cat_features = None


# ============================================================
# HELPER: CHECK MISSING VALUES
# ============================================================

def is_missing(value):

    if value is None:
        return True

    try:
        return bool(pd.isna(value))
    except (TypeError, ValueError):
        return False


# ============================================================
# LOAD TRAINED CATBOOST MODEL
# ============================================================

def load_model():

    global loaded_model
    global selected_features
    global cat_features

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"CatBoost model file not found: {MODEL_PATH}"
        )

    if not os.path.exists(FEATURES_PATH):
        raise FileNotFoundError(
            f"Model feature schema not found: {FEATURES_PATH}"
        )

    print("--> Loading ASTRA CatBoost model...")

    from catboost import CatBoostRegressor

    model = CatBoostRegressor()
    model.load_model(MODEL_PATH)

    with open(FEATURES_PATH, "r") as f:
        schema = json.load(f)

    features = schema.get("features")
    categorical_features = schema.get("cat_features")

    if not isinstance(features, list) or not features:
        raise ValueError(
            "Invalid feature schema. "
            "'features' must be a non-empty list."
        )

    if not isinstance(categorical_features, list):
        raise ValueError(
            "Invalid feature schema. "
            "'cat_features' must be a list."
        )

    if len(features) != len(set(features)):
        raise ValueError(
            "Duplicate feature names found in model schema."
        )

    if not set(categorical_features).issubset(set(features)):
        raise ValueError(
            "Categorical features do not match the model schema."
        )

    if not OPTIONAL_FEATURES.issubset(set(features)):
        raise ValueError(
            "One or more documented optional features "
            "are missing from selected_features.json."
        )

    loaded_model = model
    selected_features = features
    cat_features = set(categorical_features)

    print(
        "--> ASTRA model loaded successfully!"
    )

    print(
        f"--> Expected features: {len(selected_features)}"
    )

    print(
        f"--> Categorical features: {sorted(cat_features)}"
    )

    print(
        f"--> Optional features: {sorted(OPTIONAL_FEATURES)}"
    )


# ============================================================
# VALIDATE AND PREPARE INPUT DATA
# ============================================================

def prepare_input(data: Dict[str, Any]):

    if loaded_model is None:
        raise RuntimeError(
            "CatBoost model is not loaded. "
            "Restart the backend after checking the model files."
        )

    if not selected_features:
        raise RuntimeError(
            "Model feature schema is not loaded."
        )

    if not isinstance(data, dict):
        raise ValueError(
            "Input data must be a dictionary of CDM features."
        )

    # --------------------------------------------------------
    # Check supplied feature names
    # --------------------------------------------------------

    supplied_features = set(data.keys())
    expected_features = set(selected_features)

    unexpected_features = sorted(
        supplied_features - expected_features
    )

    if unexpected_features:
        raise ValueError(
            f"Unexpected feature columns: "
            f"{unexpected_features[:15]}"
        )

    # --------------------------------------------------------
    # Identify missing features
    # --------------------------------------------------------

    missing_features = sorted(
        expected_features - supplied_features
    )

    missing_required = [
        feature
        for feature in missing_features
        if feature not in OPTIONAL_FEATURES
    ]

    if missing_required:
        raise ValueError(
            "Missing required model features: "
            f"{missing_required[:15]}"
        )

    # --------------------------------------------------------
    # Build model input in exact training feature order
    # --------------------------------------------------------

    row = {}

    for feature in selected_features:

        value = data.get(feature, np.nan)

        # Categorical feature validation
        if feature in cat_features:

            if is_missing(value):
                raise ValueError(
                    f"Required categorical feature "
                    f"'{feature}' is missing."
                )

            value = str(value).strip()

            if not value:
                raise ValueError(
                    f"Categorical feature '{feature}' is empty."
                )

        # Numerical feature validation
        else:

            if is_missing(value):
                value = np.nan

            else:

                if isinstance(value, (bool, np.bool_)):
                    raise ValueError(
                        f"Feature '{feature}' must be numerical, "
                        "not boolean."
                    )

                try:
                    value = float(value)

                except (TypeError, ValueError):
                    raise ValueError(
                        f"Feature '{feature}' must contain "
                        "a numerical value."
                    )

                if not np.isfinite(value):
                    raise ValueError(
                        f"Feature '{feature}' contains "
                        "an infinite or invalid value."
                    )

        row[feature] = value

    # Preserve exact model feature order
    df = pd.DataFrame(
        [row],
        columns=selected_features,
    )

    return df, missing_features


# ============================================================
# CATBOOST PREDICTION
# ============================================================

def predict_data(data: Dict[str, Any]):

    df, missing_features = prepare_input(data)

    # --------------------------------------------------------
    # Predict continuous log10(Pc)
    # --------------------------------------------------------

    prediction = float(
        loaded_model.predict(df)[0]
    )

    if not np.isfinite(prediction):
        raise RuntimeError(
            "CatBoost returned an invalid prediction."
        )

    log10_pc = prediction

    # --------------------------------------------------------
    # Convert log10(Pc) into collision probability
    # --------------------------------------------------------

    try:
        probability_of_collision = 10 ** log10_pc

    except OverflowError:
        raise RuntimeError(
            "Predicted collision probability is outside "
            "the supported numerical range."
        )

    if not np.isfinite(probability_of_collision):
        raise RuntimeError(
            "Invalid collision probability generated."
        )

    # --------------------------------------------------------
    # Risk classification
    #
    # Low:    log10(Pc) <= -20
    # Medium: -20 < log10(Pc) <= -12
    # High:   log10(Pc) > -12
    # --------------------------------------------------------

    if log10_pc > -12:
        risk_level = "High"

    elif log10_pc > -20:
        risk_level = "Medium"

    else:
        risk_level = "Low"

    # --------------------------------------------------------
    # Display-only risk score
    # This is NOT probability or model confidence.
    # --------------------------------------------------------

    risk_score = max(
        0,
        min(
            100,
            round(
                (log10_pc + 30) / (30 - 1.4) * 100
            ),
        ),
    )

    # --------------------------------------------------------
    # Prediction response
    # --------------------------------------------------------

    result = {
        "prediction": risk_level,

        "log10_probability_of_collision": round(
            log10_pc,
            4,
        ),

        "probability_of_collision": probability_of_collision,

        "risk_score": risk_score,

        "confidence": None,

        "status": "success",

        "is_alert": risk_level == "High",
    }

    # --------------------------------------------------------
    # Warning for missing optional features
    # --------------------------------------------------------

    if missing_features:

        result["warning"] = (
            "Optional missingness-indicator features "
            "were absent and passed as NaN: "
            + ", ".join(missing_features)
        )

        result["missing_optional_features"] = missing_features

    return result


# ============================================================
# FILE VALIDATION AND PREDICTION
# ============================================================

def predict_from_file(
    file_bytes: bytes,
    filename: str,
):

    # --------------------------------------------------------
    # Validate uploaded file
    # --------------------------------------------------------

    if not file_bytes:
        raise ValueError(
            "Uploaded file is empty."
        )

    if not filename or "." not in filename:
        raise ValueError(
            "Invalid filename or missing file extension."
        )

    ext = filename.rsplit(".", 1)[-1].lower()

    # --------------------------------------------------------
    # Read CSV or Excel
    # --------------------------------------------------------

    try:

        if ext == "csv":

            df = pd.read_csv(
                io.BytesIO(file_bytes)
            )

        elif ext in ("xlsx", "xls"):

            df = pd.read_excel(
                io.BytesIO(file_bytes)
            )

        else:

            raise ValueError(
                f"Unsupported file format '.{ext}'. "
                "Only CSV, XLSX and XLS are supported."
            )

    except ValueError:
        raise

    except Exception as e:

        raise ValueError(
            f"Unable to read uploaded file: {str(e)}"
        )

    if df.empty:
        raise ValueError(
            "Uploaded file contains no data rows."
        )

    # --------------------------------------------------------
    # Validate column names
    # --------------------------------------------------------

    if any(not isinstance(column, str) for column in df.columns):
        raise ValueError(
            "All dataset column names must be text."
        )

    df.columns = [
        column.strip()
        for column in df.columns
    ]

    if df.columns.duplicated().any():

        duplicates = df.columns[
            df.columns.duplicated()
        ].tolist()

        raise ValueError(
            f"Duplicate column names found: {duplicates}"
        )

    # --------------------------------------------------------
    # Validate required columns
    # --------------------------------------------------------

    supplied_features = set(df.columns)
    expected_features = set(selected_features)

    unexpected_features = sorted(
        supplied_features - expected_features
    )

    if unexpected_features:
        raise ValueError(
            f"Unexpected dataset columns: "
            f"{unexpected_features[:15]}"
        )

    missing_features = sorted(
        expected_features - supplied_features
    )

    missing_required = [
        feature
        for feature in missing_features
        if feature not in OPTIONAL_FEATURES
    ]

    if missing_required:
        raise ValueError(
            "Dataset is missing required model features: "
            f"{missing_required[:15]}"
        )

    # --------------------------------------------------------
    # Analyse first data row only
    # --------------------------------------------------------

    first_row = df.iloc[0].to_dict()

    result = predict_data(first_row)

    # --------------------------------------------------------
    # Add upload metadata
    # --------------------------------------------------------

    result["filename"] = filename

    result["record_count"] = len(df)

    result["records_analyzed"] = 1

    result["prediction_scope"] = "First data row only"

    return result


# ============================================================
# IMAGE PREDICTION NOT SUPPORTED
# ============================================================

def predict_image(image_bytes: bytes) -> Dict[str, Any]:

    raise ValueError(
        "Image prediction is not supported. "
        "ASTRA uses tabular Conjunction Data Message "
        "(CDM) data for CatBoost future-risk prediction."
    )