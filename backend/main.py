import json
import os

from typing import Dict, Any

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    HTTPException,
    Depends,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

import predict
import auth

from database import get_db, init_db
from audit import init_audit_table, log_event, get_user_logs, get_all_logs


# --------------------------------------------------
# FASTAPI INITIALIZATION
# --------------------------------------------------

app = FastAPI(
    title="Astra SDC-II API",
    description="Backend service for satellite conjunction risk prediction.",
    version="2.0.0",
)

origins = os.getenv(
    "ASTRA_CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8080,http://127.0.0.1:8080",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    email: str
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


class PredictionRequest(BaseModel):
    features: Dict[str, Any]


# --------------------------------------------------
# AUTHENTICATION
# --------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        payload = auth.decode_access_token(token)
        user_id = int(payload["sub"])

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    with get_db() as db:
        user = db.execute(
            """
            SELECT id, full_name, email, role, is_active
            FROM users
            WHERE id = ?
            """,
            (user_id,),
        ).fetchone()

    if not user or not user["is_active"]:
        raise HTTPException(
            status_code=401,
            detail="User account is unavailable.",
        )

    return dict(user)


def require_admin(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Administrator access required.",
        )

    return current_user


# --------------------------------------------------
# DATABASE HELPERS
# --------------------------------------------------

def save_prediction(user_id: int, result: dict, upload_id=None):
    """Save a prediction and its SHAP explanation."""

    with get_db() as db:
        db.execute(
            """
            INSERT INTO predictions (
                user_id,
                upload_id,
                risk_level,
                risk_score,
                collision_probability,
                prediction_json
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                upload_id,
                result.get("prediction"),
                result.get("risk_score"),
                result.get("probability_of_collision"),
                json.dumps(result, default=str),
            ),
        )


# --------------------------------------------------
# STARTUP
# --------------------------------------------------

@app.on_event("startup")
async def startup_event():
    print("Initializing Astra Backend Server...")

    init_db()
    init_audit_table()
    predict.load_model()

    print("Astra Backend Ready.")


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def read_root():
    return {
        "project": "Astra SDC-II",
        "status": "Online",
        "model_loaded": predict.loaded_model is not None,
        "mode": (
            "Live Model"
            if predict.loaded_model is not None
            else "Model Not Loaded"
        ),
    }


# --------------------------------------------------
# USER REGISTRATION
# --------------------------------------------------

@app.post("/auth/register", status_code=201)
def register_endpoint(payload: RegisterRequest):

    try:
        user = auth.register_user(
            payload.full_name,
            payload.email,
            payload.password,
        )

        log_event(
            event_type="USER_REGISTERED",
            description=f"New account registered: {payload.email}",
            user_id=user.get("id"),
            actor_email=payload.email,
        )

        return {
            "message": "Registration successful.",
            "user": user,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# --------------------------------------------------
# USER LOGIN
# --------------------------------------------------

@app.post("/auth/login")
def login_endpoint(payload: LoginRequest):

    result = auth.authenticate_user(
        payload.email,
        payload.password,
    )

    if not result:
        log_event(
            event_type="LOGIN_FAILED",
            description=f"Failed login attempt for {payload.email}",
            actor_email=payload.email,
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    logged_in_user = result.get("user", {})

    log_event(
        event_type="USER_LOGIN",
        description=f"User logged in: {payload.email}",
        user_id=logged_in_user.get("id"),
        actor_email=payload.email,
    )

    return result


# --------------------------------------------------
# CURRENT USER
# --------------------------------------------------

@app.get("/auth/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "user": current_user,
    }


# --------------------------------------------------
# TABULAR FILE PREDICTION
# --------------------------------------------------

@app.post("/predict/tabular")
async def predict_tabular_endpoint(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file has no filename.",
        )

    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty.",
            )

        result = predict.predict_from_file(
            file_bytes,
            file.filename,
        )

        # Save upload under the authenticated user.
        with get_db() as db:
            cursor = db.execute(
                """
                INSERT INTO uploads (
                    user_id,
                    filename,
                    file_size,
                    record_count
                )
                VALUES (?, ?, ?, ?)
                """,
                (
                    current_user["id"],
                    file.filename,
                    len(file_bytes),
                    result.get("record_count"),
                ),
            )

            upload_id = cursor.lastrowid

        # Save prediction and SHAP explanation.
        save_prediction(
            current_user["id"],
            result,
            upload_id,
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {str(error)}",
        )


# --------------------------------------------------
# JSON PREDICTION
# --------------------------------------------------

@app.post("/predict/json")
async def predict_json_endpoint(
    payload: PredictionRequest,
    current_user=Depends(get_current_user),
):

    try:
        result = predict.predict_data(
            payload.features,
        )

        save_prediction(
            current_user["id"],
            result,
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {str(error)}",
        )


# --------------------------------------------------
# ADMIN: VIEW ALL USERS
# --------------------------------------------------

@app.get("/admin/users")
def get_all_users(admin=Depends(require_admin)):

    with get_db() as db:
        users = db.execute(
            """
            SELECT id, full_name, email, role, is_active, created_at
            FROM users
            ORDER BY created_at DESC
            """
        ).fetchall()

    return {
        "users": [dict(user) for user in users],
    }


# --------------------------------------------------
# ADMIN: VIEW ALL UPLOADS AND PREDICTIONS
# --------------------------------------------------

@app.get("/admin/records")
def get_all_records(admin=Depends(require_admin)):

    with get_db() as db:
        uploads = db.execute(
            """
            SELECT uploads.*, users.email
            FROM uploads
            JOIN users ON uploads.user_id = users.id
            ORDER BY uploads.uploaded_at DESC
            """
        ).fetchall()

        predictions = db.execute(
            """
            SELECT predictions.*, users.email
            FROM predictions
            JOIN users ON predictions.user_id = users.id
            ORDER BY predictions.created_at DESC
            """
        ).fetchall()

    return {
        "uploads": [dict(row) for row in uploads],
        "predictions": [dict(row) for row in predictions],
    }


# --------------------------------------------------
# USER: VIEW OWN HISTORY
# --------------------------------------------------

@app.get("/history")
def get_user_history(current_user=Depends(get_current_user)):

    with get_db() as db:
        uploads = db.execute(
            """
            SELECT *
            FROM uploads
            WHERE user_id = ?
            ORDER BY uploaded_at DESC
            """,
            (current_user["id"],),
        ).fetchall()

        predictions = db.execute(
            """
            SELECT *
            FROM predictions
            WHERE user_id = ?
            ORDER BY created_at DESC
            """,
            (current_user["id"],),
        ).fetchall()

    return {
        "uploads": [dict(row) for row in uploads],
        "predictions": [dict(row) for row in predictions],
    }


# --------------------------------------------------
# AUDIT LOGS
# --------------------------------------------------

@app.get("/audit-logs")
def user_audit_logs(current_user=Depends(get_current_user)):
    """Return activity belonging only to the authenticated user."""

    logs = get_user_logs(
        user_id=current_user["id"],
        limit=100,
    )

    return {
        "total": len(logs),
        "logs": logs,
    }


@app.get("/admin/audit-logs")
def admin_audit_logs(
    current_admin=Depends(require_admin),
):
    """Return activity across all accounts to administrators."""

    logs = get_all_logs(limit=500)

    return {
        "total": len(logs),
        "logs": logs,
    }
