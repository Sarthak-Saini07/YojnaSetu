#!/usr/bin/env python3
"""
Import cleaned government schemes into MongoDB.
Preserves existing verified schemes and performs high-performance bulk upsert.
DO NOT RUN IN PRODUCTION WITHOUT USER APPROVAL.
"""

import sys
import json
import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any
from pymongo import UpdateOne

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.database import db_manager
from app.repositories.scheme_repository import scheme_repository

CLEANED_JSON_PATH = BASE_DIR / "backend" / "data" / "schemes_cleaned.json"


def import_schemes(dry_run: bool = False, batch_size: int = 500):
    if not CLEANED_JSON_PATH.exists():
        raise FileNotFoundError(f"Cleaned schemes file not found: {CLEANED_JSON_PATH}")

    print(f"Loading cleaned dataset from {CLEANED_JSON_PATH}...")
    with open(CLEANED_JSON_PATH, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    total_schemes = len(schemes)
    print(f"Total schemes to process: {total_schemes}")

    if dry_run:
        print("\n[DRY RUN MODE ENABLED - No changes will be written to MongoDB]")

    print("Connecting to MongoDB...")
    db_manager.connect()
    db = db_manager.get_database()
    collection = db["schemes"]

    # Check existing schemes to safeguard authoritative verified schemes
    print("Checking existing schemes in MongoDB...")
    existing_cursor = collection.find({}, {"slug": 1, "source_type": 1, "eligibility_verified": 1})
    existing_protected = set()
    existing_all = set()
    for doc in existing_cursor:
        slug = doc.get("slug")
        if slug:
            existing_all.add(slug)
            # If already in DB and not third_party_dataset, it's an authoritative seed/admin scheme
            if doc.get("source_type") != "third_party_dataset":
                existing_protected.add(slug)

    print(f"Current schemes in DB: {len(existing_all)}")
    print(f"Authoritative curated schemes protected from overwrite: {len(existing_protected)}")

    # Ensure repository indexes exist
    if not dry_run:
        print("Ensuring database indexes...")
        scheme_repository.create_indexes()

    operations: List[UpdateOne] = []
    skipped_verified = 0
    now = datetime.now(timezone.utc)

    for s in schemes:
        slug = s.get("slug")
        if not slug:
            continue

        # Rule: Never overwrite or downgrade an authoritative curated scheme
        if slug in existing_protected:
            skipped_verified += 1
            continue

        doc = dict(s)
        doc["updated_at"] = now
        
        # Prepare bulk upsert operation
        operations.append(
            UpdateOne(
                {"slug": slug},
                {
                    "$set": doc,
                    "$setOnInsert": {"created_at": now}
                },
                upsert=True
            )
        )

    print(f"Authoritative schemes preserved without modification: {skipped_verified}")
    print(f"Operations queued for bulk upsert: {len(operations)}")

    if dry_run:
        print("\n[DRY RUN COMPLETE] Successfully validated all operations. Zero writes performed.")
        return {
            "total_in_file": total_schemes,
            "queued_operations": len(operations),
            "skipped_verified": skipped_verified,
            "dry_run": True
        }

    # Execute in batches
    total_upserted = 0
    total_modified = 0

    print(f"\nExecuting bulk upserts in batches of {batch_size}...")
    for i in range(0, len(operations), batch_size):
        batch = operations[i:i + batch_size]
        result = collection.bulk_write(batch, ordered=False)
        total_upserted += len(result.upserted_ids)
        total_modified += result.modified_count
        print(f"  Processed {min(i + batch_size, len(operations))}/{len(operations)}... "
              f"(Upserted: {total_upserted}, Modified: {total_modified})")

    final_db_count = collection.count_documents({})
    print("\n" + "=" * 60)
    print("IMPORT COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print(f"Total schemes in file:             {total_schemes}")
    print(f"Newly inserted schemes:            {total_upserted}")
    print(f"Updated existing unverified:       {total_modified}")
    print(f"Protected authoritative schemes:   {skipped_verified}")
    print(f"Total schemes now in database:     {final_db_count}")
    print("=" * 60)

    return {
        "total_in_file": total_schemes,
        "newly_inserted": total_upserted,
        "modified": total_modified,
        "skipped_verified": skipped_verified,
        "final_db_count": final_db_count
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import cleaned government schemes to MongoDB")
    parser.add_argument("--dry-run", action="store_true", help="Validate without writing to database")
    parser.add_argument("--batch-size", type=int, default=500, help="Batch size for bulk write")
    args = parser.parse_args()

    import_schemes(dry_run=args.dry_run, batch_size=args.batch_size)
