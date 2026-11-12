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


# Identifier columns that are not used by the trained model.
# Only verified identifier columns should be added here.

IDENTIFIER_COLUMNS = {
    "mission_id",
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

    # Verify the loaded model and feature schema agree.
    if model.feature_names_:
        if list(model.feature_names_) != features:
            raise ValueError(
                "Loaded CatBoost model feature names do not "
                "match selected_features.json or their order."
            )

    loaded_model = model
    selected_features = features
    cat_features = set(categorical_features)

    print("--> ASTRA model loaded successfully!")

    print(
        f"--> Expected features: {len(selected_features)}"
    )

    print(
        f"--> Categorical features: {sorted(cat_features)}"
    )

    print(
        f"--> Optional features: {sorted(OPTIONAL_FEATURES)}"
    )

    print("--> Native CatBoost SHAP calculation enabled.")


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
    # Remove verified identifier columns
    # --------------------------------------------------------

    data = {
        key: value
        for key, value in data.items()
        if key not in IDENTIFIER_COLUMNS
    }

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
# GENERATE NATIVE CATBOOST SHAP EXPLANATION
# ============================================================

def generate_shap_explanation(
    df: pd.DataFrame,
    prediction: float,
):

    if loaded_model is None:
        raise RuntimeError(
            "CatBoost model is not loaded."
        )

    from catboost import Pool

    # --------------------------------------------------------
    # Create CatBoost Pool in exact model feature order
    # --------------------------------------------------------

    pool = Pool(
        data=df,
        cat_features=[
            feature
            for feature in selected_features
            if feature in cat_features
        ],
    )

    # --------------------------------------------------------
    # Calculate actual SHAP values
    #
    # Output shape:
    # (number of rows, number of features + 1)
    #
    # Last column = expected/base value
    # Other columns = individual feature contributions
    # --------------------------------------------------------

    shap_matrix = loaded_model.get_feature_importance(
        data=pool,
        type="ShapValues",
    )

    shap_matrix = np.asarray(shap_matrix)

    expected_shape = (
        1,
        len(selected_features) + 1,
    )

    if shap_matrix.shape != expected_shape:
        raise RuntimeError(
            "Unexpected CatBoost SHAP output shape. "
            f"Expected {expected_shape}, "
            f"received {shap_matrix.shape}."
        )

    if not np.all(np.isfinite(shap_matrix)):
        raise RuntimeError(
            "CatBoost generated invalid SHAP values."
        )

    # --------------------------------------------------------
    # Separate feature contributions and base value
    # --------------------------------------------------------

    shap_values = shap_matrix[0, :-1]

    base_value = float(
        shap_matrix[0, -1]
    )

    # --------------------------------------------------------
    # Build contribution objects for frontend
    # --------------------------------------------------------

    contributions = [
        {
            "feature": feature,
            "shap_value": float(shap_value),
        }
        for feature, shap_value in zip(
            selected_features,
            shap_values,
        )
    ]

    # Sort by absolute contribution magnitude.
    # This does not alter the underlying SHAP values.

    contributions.sort(
        key=lambda item: abs(item["shap_value"]),
        reverse=True,
    )

    # --------------------------------------------------------
    # Verify SHAP additivity
    #
    # Prediction = Base value + Sum of SHAP values
    # --------------------------------------------------------

    sum_of_shap_values = float(
        np.sum(shap_values)
    )

    reconstructed_prediction = float(
        base_value + sum_of_shap_values
    )

    absolute_difference = float(
        abs(prediction - reconstructed_prediction)
    )

    additivity_tolerance = max(
        1e-6,
        abs(prediction) * 1e-6,
    )

    additivity_verified = bool(
        absolute_difference <= additivity_tolerance
    )

    # --------------------------------------------------------
    # Interpretation
    # --------------------------------------------------------

    interpretation = (
        "SHAP values explain the CatBoost model's "
        "predicted log10(Pc). Positive SHAP values "
        "increase the predicted log10(Pc), while "
        "negative SHAP values decrease it. "
        "Feature contributions are calculated using "
        "CatBoost's native ShapValues implementation."
    )

    # --------------------------------------------------------
    # Return frontend-compatible explanation
    # --------------------------------------------------------

    explanation = {

        "contributions": contributions,

        "base_value": base_value,

        "final_prediction": float(prediction),

        "model_prediction": float(prediction),

        "reconstructed_prediction": reconstructed_prediction,

        "sum_of_shap_values": sum_of_shap_values,

        "absolute_difference": absolute_difference,

        "additivity_tolerance": float(
            additivity_tolerance
        ),

        "additivity_verified": additivity_verified,

        "interpretation": interpretation,

    }

    print(
        "--> SHAP explanation generated successfully."
    )

    print(
        f"--> SHAP features: {len(contributions)}"
    )

    print(
        f"--> SHAP additivity verified: {additivity_verified}"
    )

    print(
        f"--> SHAP reconstruction difference: "
        f"{absolute_difference:.12g}"
    )

    return explanation


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
    # Generate SHAP explanation
    # --------------------------------------------------------

    explanation = generate_shap_explanation(
        df=df,
        prediction=prediction,
    )

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

        "explanation": explanation,

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
    # Remove verified identifier columns
    # --------------------------------------------------------

    ignored_columns = [
        column
        for column in IDENTIFIER_COLUMNS
        if column in df.columns
    ]

    if ignored_columns:

        print(
            "--> Ignoring non-model identifier columns: "
            f"{ignored_columns}"
        )

        df = df.drop(
            columns=ignored_columns
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