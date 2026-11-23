import json

from database import get_db


def init_audit_table():
    """Create the persistent audit log table without modifying existing tables."""

    with get_db() as db:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                actor_email TEXT,
                event_type TEXT NOT NULL,
                description TEXT,
                metadata_json TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        db.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_audit_user_id
            ON audit_logs(user_id)
            """
        )

        db.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_audit_created_at
            ON audit_logs(created_at)
            """
        )


def log_event(
    event_type,
    description,
    user_id=None,
    actor_email=None,
    metadata=None,
):
    """Persist one user activity event."""

    with get_db() as db:
        db.execute(
            """
            INSERT INTO audit_logs (
                user_id,
                actor_email,
                event_type,
                description,
                metadata_json
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                user_id,
                actor_email,
                event_type,
                description,
                json.dumps(metadata or {}, default=str),
            ),
        )


def get_user_logs(user_id, limit=100):
    """Return only the authenticated user's activity."""

    with get_db() as db:
        rows = db.execute(
            """
            SELECT
                id,
                user_id,
                actor_email,
                event_type,
                description,
                metadata_json,
                created_at
            FROM audit_logs
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()

    return [dict(row) for row in rows]


def get_all_logs(limit=500):
    """Return activity across all accounts for administrators."""

    with get_db() as db:
        rows = db.execute(
            """
            SELECT
                audit_logs.id,
                audit_logs.user_id,
                audit_logs.actor_email,
                audit_logs.event_type,
                audit_logs.description,
                audit_logs.metadata_json,
                audit_logs.created_at,
                users.full_name
            FROM audit_logs
            LEFT JOIN users ON users.id = audit_logs.user_id
            ORDER BY audit_logs.id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    return [dict(row) for row in rows]
