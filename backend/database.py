import os
import sqlite3
from pathlib import Path
from contextlib import contextmanager

# Store the database outside the source-code files.
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(
    os.getenv("ASTRA_DATABASE_PATH", BASE_DIR / "astra.db")
)


@contextmanager
def get_db():
    """Create and manage a SQLite database connection."""
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row

    try:
        connection.execute("PRAGMA foreign_keys = ON")
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_db():
    """Create ASTRA database tables if they do not exist."""

    with get_db() as db:

        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user'
                    CHECK(role IN ('user', 'admin')),
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS uploads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                filename TEXT NOT NULL,
                file_size INTEGER,
                record_count INTEGER,
                uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            )
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                upload_id INTEGER,
                risk_level TEXT,
                risk_score REAL,
                collision_probability REAL,
                prediction_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                FOREIGN KEY (upload_id)
                    REFERENCES uploads(id)
                    ON DELETE SET NULL
            )
        """)

        db.execute("""
            CREATE INDEX IF NOT EXISTS idx_uploads_user_id
            ON uploads(user_id)
        """)

        db.execute("""
            CREATE INDEX IF NOT EXISTS idx_predictions_user_id
            ON predictions(user_id)
        """)


if __name__ == "__main__":
    init_db()
    print(f"ASTRA database initialized at: {DATABASE_PATH}")