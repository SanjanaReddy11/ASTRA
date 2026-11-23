import getpass

from pwdlib import PasswordHash
from database import init_db, get_db


password_hasher = PasswordHash.recommended()


def create_admin():
    init_db()

    print("\nASTRA - Initial Admin Setup\n")

    full_name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()

    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")

    if not full_name or not email:
        print("Name and email are required.")
        return

    if len(password) < 8:
        print("Password must contain at least 8 characters.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    with get_db() as db:
        existing_admin = db.execute(
            "SELECT id FROM users WHERE role = 'admin'"
        ).fetchone()

        if existing_admin:
            print("An administrator account already exists.")
            return

        existing_user = db.execute(
            "SELECT id FROM users WHERE email = ?",
            (email,),
        ).fetchone()

        if existing_user:
            print("An account with this email already exists.")
            return

        password_hash = password_hasher.hash(password)

        db.execute(
            """
            INSERT INTO users (
                full_name,
                email,
                password_hash,
                role
            )
            VALUES (?, ?, ?, 'admin')
            """,
            (full_name, email, password_hash),
        )

    print("\nAdministrator account created successfully!")


if __name__ == "__main__":
    create_admin()
