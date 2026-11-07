"""
MongoDB Atlas Connection Diagnostic & Verification Script
Government Scheme Recommendation System

Usage:
    python backend/scripts/test_atlas_connection.py
    python backend/scripts/test_atlas_connection.py --uri "mongodb+srv://sarthaksaini23_db_user:<password>@govt.1odpl43.mongodb.net/"
    python backend/scripts/test_atlas_connection.py --db "government_scheme_db"
"""

import sys
import os
import argparse
import time
import re
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, OperationFailure, PyMongoError


def mask_uri(uri: str) -> str:
    """Mask credentials in MongoDB URI for secure terminal logging."""
    return re.sub(r"://([^:]+):([^@]+)@", r"://\1:****@", uri)


def test_connection(uri: str, db_name: str) -> bool:
    print("=" * 70)
    print("  MongoDB Atlas Connection Diagnostic Test")
    print("=" * 70)
    print(f"Target URI      : {mask_uri(uri)}")
    print(f"Target Database : {db_name}")
    print("-" * 70)

    is_atlas = "mongodb+srv://" in uri or "mongodb.net" in uri
    print(f"Connection Type : {'MongoDB Atlas (Cloud Cluster)' if is_atlas else 'Local / Standalone MongoDB'}")

    start_time = time.time()
    try:
        print("\n1. Initializing MongoClient with server selection timeout = 8000ms...")
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=8000,
            connectTimeoutMS=8000,
            maxPoolSize=20,
        )

        print("2. Sending ping command to verify authentication & network reachability...")
        ping_res = client.admin.command("ping")
        elapsed = (time.time() - start_time) * 1000
        print(f"   [SUCCESS] Cluster responded to ping in {elapsed:.1f}ms: {ping_res}")

        print(f"\n3. Connecting to database: '{db_name}'...")
        db = client[db_name]
        collections = db.list_collection_names()
        print(f"   [SUCCESS] Available collections ({len(collections)}): {collections}")

        for col_name in collections:
            cnt = db[col_name].count_documents({})
            print(f"   - {col_name}: {cnt:,} documents")

        print("\n4. Verifying write & read permissions (temporary test document)...")
        test_col = db["_conn_test"]
        insert_res = test_col.insert_one({"diagnostic_test": True, "timestamp": time.time()})
        assert insert_res.inserted_id is not None
        find_res = test_col.find_one({"_id": insert_res.inserted_id})
        assert find_res is not None
        test_col.delete_one({"_id": insert_res.inserted_id})
        print("   [SUCCESS] Write, Read, and Delete operations verified successfully.")

        print("\n" + "=" * 70)
        print("  ALL TESTS PASSED: MongoDB Atlas cluster is fully operational!")
        print("=" * 70)
        return True

    except ServerSelectionTimeoutError as e:
        print("\n[ERROR] Connection Timed Out (ServerSelectionTimeoutError):")
        print("  - Could not establish connection to the cluster within 8 seconds.")
        print("  - Root Cause: Likely IP Whitelist restriction in MongoDB Atlas.")
        print("  - Resolution: In MongoDB Atlas Dashboard -> Network Access -> Add IP Address.")
        print("    Add your current IP or allow '0.0.0.0/0' for cloud deployments (e.g. Render).")
        return False

    except OperationFailure as e:
        print(f"\n[ERROR] Authentication or Authorization Failed: {e}")
        if "bad auth" in str(e).lower() or "authentication failed" in str(e).lower():
            print("  - Root Cause: Incorrect username or password for MongoDB Atlas.")
            print("  - Resolution: Check MongoDB Atlas -> Database Access.")
            print("    Verify the user 'sarthaksaini23_db_user' exists and reset its password if needed.")
            print("    Ensure the password does not contain unescaped URI special characters (@, :, /, ?).")
        return False

    except ConnectionFailure as e:
        print(f"\n[ERROR] Network Connection Failure: {e}")
        return False

    except Exception as e:
        print(f"\n[ERROR] Unexpected error during connection test: {e}")
        return False


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test MongoDB Atlas Connection")
    parser.add_argument("--uri", type=str, default="", help="MongoDB connection URI")
    parser.add_argument("--db", type=str, default="", help="Target database name")
    args = parser.parse_args()

    # Load from settings / .env if not explicitly passed
    from app.config import settings

    target_uri = args.uri or os.getenv("MONGODB_URI") or settings.MONGODB_URI
    target_db = args.db or os.getenv("DATABASE_NAME") or settings.DATABASE_NAME

    success = test_connection(target_uri, target_db)
    sys.exit(0 if success else 1)

