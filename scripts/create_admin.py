#!/usr/bin/env python3
"""
Secure controlled script to provision or elevate administrator accounts.
Usage:
    python scripts/create_admin.py --email admin@gov.in --password AdminSecurePassword123! --name "Administrator"
"""

import sys
import argparse
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.database import db_manager
from app.services.auth_service import auth_service
from app.repositories.user_repository import user_repository


def main():
    parser = argparse.ArgumentParser(description="Create or elevate an administrator account securely.")
    parser.add_argument("--email", required=True, help="Administrator email address")
    parser.add_argument("--password", required=True, help="Secure administrator password (min 6 chars)")
    parser.add_argument("--name", default="System Administrator", help="Administrator full name")
    parser.add_argument("--phone", default=None, help="Administrator contact phone")
    args = parser.parse_args()

    if len(args.password) < 6:
        print("Error: Password must be at least 6 characters.")
        sys.exit(1)

    print("Connecting to MongoDB database...")
    try:
        db_manager.connect()
        user_repository.create_indexes()
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        sys.exit(1)

    print(f"Provisioning admin account for: {args.email}...")
    try:
        admin_doc = auth_service.create_admin_account(
            email=args.email,
            password=args.password,
            name=args.name,
            phone=args.phone,
        )
        print("Admin account successfully provisioned!")
        print(f"ID:    {admin_doc.get('_id')}")
        print(f"Email: {admin_doc.get('email')}")
        print(f"Role:  {admin_doc.get('role')}")
    except Exception as e:
        print(f"Error provisioning admin account: {e}")
        sys.exit(1)
    finally:
        db_manager.close()


if __name__ == "__main__":
    main()

