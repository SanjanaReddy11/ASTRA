import os
import jwt

from datetime import datetime, timedelta, timezone
from pwdlib import PasswordHash

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

SECRET_KEY = os.getenv("ASTRA_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "ASTRA_SECRET_KEY environment variable is missing. "
        "Set a secure secret before starting the backend."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()


# --------------------------------------------------
# PASSWORD FUNCTIONS
# --------------------------------------------------

def hash_password(password: str) -> str:
    """Securely hash a user's password."""
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its stored hash."""
    return password_hash.verify(password, hashed_password)


# --------------------------------------------------
# JWT TOKEN FUNCTIONS
# --------------------------------------------------

def create_access_token(user_id: int, role: str, email: str) -> str:
    """Generate a signed JWT access token."""

    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user_id),
        "role": role,
        "email": email,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Verify and decode a JWT access token."""

    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
    )


# --------------------------------------------------
# USER REGISTRATION
# --------------------------------------------------

def register_user(full_name: str, email: str, password: str) -> dict:
    """Register a new user in the SQLite database."""

    from database import get_db

    full_name = full_name.strip()
    email = email.strip().lower()

    if not full_name:
        raise ValueError("Full name is required.")

    if not email or "@" not in email:
        raise ValueError("Enter a valid email address.")

    if len(password) < 8:
        raise ValueError("Password must contain at least 8 characters.")

    hashed_password = hash_password(password)

    try:
        with get_db() as db:
            cursor = db.execute(
                """
                INSERT INTO users (full_name, email, password_hash, role)
                VALUES (?, ?, ?, 'user')
                """,
                (full_name, email, hashed_password),
            )

            user_id = cursor.lastrowid

        return {
            "id": user_id,
            "full_name": full_name,
            "email": email,
            "role": "user",
        }

    except Exception as error:
        if "UNIQUE constraint failed" in str(error):
            raise ValueError("An account with this email already exists.")

        raise


# --------------------------------------------------
# USER LOGIN
# --------------------------------------------------

def authenticate_user(email: str, password: str) -> dict | None:
    """Verify user credentials and return account details."""

    from database import get_db

    email = email.strip().lower()

    with get_db() as db:
        user = db.execute(
            """
            SELECT id, full_name, email, password_hash, role, is_active
            FROM users
            WHERE email = ?
            """,
            (email,),
        ).fetchone()

    if not user:
        return None

    if not user["is_active"]:
        return None

    if not verify_password(password, user["password_hash"]):
        return None

    user_data = {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user["role"],
    }

    token = create_access_token(
        user_id=user_data["id"],
        role=user_data["role"],
        email=user_data["email"],
    )

    return {
        "user": user_data,
        "access_token": token,
        "token_type": "bearer",
    }
