import os
import json
from typing import Dict, Any

# =====================================================================
# PATH TO MODEL FILES
# =====================================================================
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

# Global variables to hold the loaded model + the feature schema it expects
loaded_model = None
selected_features = None
cat_features = None


def load_model():
    """
    Loads the trained CatBoost conjunction-risk model and its feature schema
    into memory when the server starts.
    """
    global loaded_model, selected_features, cat_features

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"CatBoost model file not found: {MODEL_PATH}"
        )

    if not os.path.exists(FEATURES_PATH):
        raise FileNotFoundError(
            f"Model feature schema not found: {FEATURES_PATH}"
        )

    print(f"--> [MODEL] Found model file at {MODEL_PATH}. Loading model...")

    from catboost import CatBoostRegressor

    loaded_model = CatBoostRegressor()
    loaded_model.load_model(MODEL_PATH)

    with open(FEATURES_PATH, "r") as f:
        schema = json.load(f)

    selected_features = schema["features"]
    cat_features = set(schema["cat_features"])

    print(
        f"--> [MODEL] Model loaded successfully! "
        f"Expecting {len(selected_features)} features "
        f"({len(cat_features)} categorical: {sorted(cat_features)})."
    )


def predict_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes tabular/JSON input data and returns a future-risk prediction
    from the trained CatBoost conjunction-risk model.
    """
    if loaded_model is None or loaded_model == "MOCK_MODEL":
        raise RuntimeError(
            "CatBoost model is not loaded. "
            "Place the trained model and feature schema in backend/model "
            "and restart the backend."
        )

    import pandas as pd
    import numpy as np

    if not selected_features:
        raise RuntimeError(
            "Model feature schema is not loaded."
        )

    # Build the row in the exact feature order the model was trained on.
    # Missing fields are left as NaN for numeric features.
    # CatBoost handles missing numeric values natively.
    missing = [
        feat for feat in selected_features
        if feat not in data
    ]

    row = {}

    for feat in selected_features:
        val = data.get(feat, np.nan)

        if feat in cat_features:
            if (
                val is None
                or (
                    isinstance(val, float)
                    and pd.isna(val)
                )
            ):
                val = "UNKNOWN"
            else:
                val = str(val)

        row[feat] = val

    df = pd.DataFrame(
        [row],
        columns=selected_features,
    )

    # The model predicts continuous log10 probability of collision risk.
    #
    # Typical training-data range:
    # approximately -30 (very low risk) to -1.4 (highest observed risk).
    log10_pc = float(
        loaded_model.predict(df)[0]
    )

    probability_of_collision = 10 ** log10_pc

    # Project risk classification thresholds:
    #
    # Low:    log10(Pc) <= -20
    # Medium: -20 < log10(Pc) <= -12
    # High:   log10(Pc) > -12
    #
    # These thresholds match the project's classification evaluation.
    if log10_pc > -12:
        risk_level = "High"
    elif log10_pc > -20:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Display-only 0-100 risk score.
    # This does NOT represent model confidence or probability.
    risk_score_0_100 = max(
        0,
        min(
            100,
            round(
                (log10_pc + 30)
                / (30 - 1.4)
                * 100
            ),
        ),
    )

    result = {
        "prediction": risk_level,
        "log10_probability_of_collision": round(
            log10_pc,
            4,
        ),
        "probability_of_collision": probability_of_collision,
        "risk_score": risk_score_0_100,
        "confidence": None,
        "status": "success",
        "is_alert": risk_level == "High",
    }

    if missing:
        result["warning"] = (
            f"{len(missing)} feature(s) missing from payload, "
            f"treated as unknown: "
            f"{missing[:5]}"
            f"{'...' if len(missing) > 5 else ''}"
        )

    return result


def predict_from_file(
    file_bytes: bytes,
    filename: str,
) -> Dict[str, Any]:
    """
    Reads a tabular file (CSV or Excel) from raw uploaded bytes,
    takes its first data row, and runs it through predict_data().

    Supports .csv, .xlsx and .xls files.
    """
    import io
    import pandas as pd

    ext = (
        filename.rsplit(".", 1)[-1].lower()
        if "." in filename
        else ""
    )

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
            f"Unsupported file type '.{ext}'. "
            "Only .csv, .xlsx and .xls are supported "
            "for tabular prediction."
        )

    if len(df) == 0:
        raise ValueError(
            "File has no data rows."
        )

    row = df.iloc[0].to_dict()

    return predict_data(row)


def predict_image(image_bytes: bytes) -> Dict[str, Any]:
    """
    Image prediction is not part of the Astra ML pipeline.

    The current project uses tabular CDM data with a trained
    CatBoostRegressor. No computer-vision model is connected to
    the backend, so image prediction is explicitly unsupported
    rather than returning a simulated result.
    """
    raise ValueError(
        "Image prediction is not supported. "
        "Astra uses tabular Conjunction Data Message (CDM) data "
        "for CatBoost future-risk prediction."
    )