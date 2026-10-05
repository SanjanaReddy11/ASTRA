from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

import predict


# Initialize FastAPI app
app = FastAPI(
    title="Astra SDC-II API",
    description="Backend service for satellite conjunction risk prediction.",
    version="1.0.0",
)


# Enable CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Schema for JSON tabular prediction payloads
class PredictionRequest(BaseModel):
    features: Dict[str, Any]


@app.on_event("startup")
async def startup_event():
    """
    Loads the trained Astra CatBoost model when the backend starts.
    """
    print("Initializing Astra Backend Server...")
    predict.load_model()


@app.get("/")
def read_root():
    """
    Health check endpoint.
    """
    return {
        "project": "Astra SDC-II",
        "status": "Online",
        "model_loaded": predict.loaded_model is not None,
        "mode": "Live Model"
        if predict.loaded_model is not None
        else "Model Not Loaded",
    }


@app.post("/predict/tabular")
async def predict_tabular_endpoint(file: UploadFile = File(...)):
    """
    Endpoint for direct CSV/XLSX/XLS uploads.

    The backend reads the uploaded tabular file and runs the first
    data row through the trained CatBoost conjunction-risk model.
    """
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file has no filename.",
        )

    try:
        file_bytes = await file.read()
        result = predict.predict_from_file(
            file_bytes,
            file.filename,
        )
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {str(e)}",
        )


@app.post("/predict/json")
async def predict_json_endpoint(payload: PredictionRequest):
    """
    Endpoint for tabular/JSON data prediction.
    """
    try:
        result = predict.predict_data(
            payload.features,
        )
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {str(e)}",
        )