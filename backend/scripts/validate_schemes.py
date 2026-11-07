#!/usr/bin/env python3
"""
Validation script for cleaned government schemes dataset.
Validates data integrity, schema consistency, field types, and constraint rules
on backend/data/schemes_cleaned.json.
"""

import json
import re
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLEANED_JSON_PATH = BASE_DIR / "backend" / "data" / "schemes_cleaned.json"


def validate_schemes():
    if not CLEANED_JSON_PATH.exists():
        raise FileNotFoundError(f"Cleaned schemes file not found at: {CLEANED_JSON_PATH}")

    print(f"Loading cleaned dataset: {CLEANED_JSON_PATH}...")
    with open(CLEANED_JSON_PATH, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    total_schemes = len(schemes)
    print(f"Total schemes to validate: {total_schemes}\n")

    errors: List[str] = []
    warnings: List[str] = []

    seen_slugs = set()
    slug_duplicates = 0

    valid_urls_count = 0
    age_constrained_count = 0
    income_constrained_count = 0
    third_party_verified_count = 0
    eligibility_unverified_count = 0

    for idx, s in enumerate(schemes, start=1):
        slug = s.get("slug")
        name = s.get("name")

        # 1. Slug check
        if not slug or not isinstance(slug, str):
            errors.append(f"Row {idx}: Missing or invalid slug")
        elif slug in seen_slugs:
            slug_duplicates += 1
            errors.append(f"Row {idx}: Duplicate slug '{slug}'")
        else:
            seen_slugs.add(slug)

        # 2. Name check
        if not name or not isinstance(name, str) or not name.strip():
            errors.append(f"Row {idx} ({slug}): Missing scheme name")

        # 3. Source & Verification metadata
        if s.get("source_type") == "third_party_dataset":
            third_party_verified_count += 1
        else:
            errors.append(f"Row {idx} ({slug}): source_type is not 'third_party_dataset' (found: {s.get('source_type')})")

        if s.get("eligibility_verified") is False:
            eligibility_unverified_count += 1
        else:
            errors.append(f"Row {idx} ({slug}): eligibility_verified must be False (found: {s.get('eligibility_verified')})")

        # 4. Eligibility structure
        elig = s.get("eligibility")
        if not isinstance(elig, dict):
            errors.append(f"Row {idx} ({slug}): 'eligibility' must be a dict")
            continue

        # Age checks
        age_obj = elig.get("age", {})
        min_age = age_obj.get("min")
        max_age = age_obj.get("max")

        if min_age is not None:
            if not isinstance(min_age, int):
                errors.append(f"Row {idx} ({slug}): min_age is not int ({type(min_age)})")
            elif min_age < 0 or min_age > 120:
                errors.append(f"Row {idx} ({slug}): min_age out of range [0, 120]: {min_age}")

        if max_age is not None:
            if not isinstance(max_age, int):
                errors.append(f"Row {idx} ({slug}): max_age is not int ({type(max_age)})")
            elif max_age < 0 or max_age > 120:
                errors.append(f"Row {idx} ({slug}): max_age out of range [0, 120]: {max_age}")

        if min_age is not None and max_age is not None:
            if min_age > max_age:
                errors.append(f"Row {idx} ({slug}): min_age ({min_age}) > max_age ({max_age})")

        if min_age is not None or max_age is not None:
            age_constrained_count += 1

        # Income checks
        income_obj = elig.get("income", {})
        max_income = income_obj.get("max")
        if max_income is not None:
            if not isinstance(max_income, (int, float)):
                errors.append(f"Row {idx} ({slug}): max_income is not numeric ({type(max_income)})")
            elif max_income <= 0:
                errors.append(f"Row {idx} ({slug}): max_income must be > 0 (found: {max_income})")
            else:
                income_constrained_count += 1

        # Gender checks
        gender = elig.get("gender")
        if not isinstance(gender, list):
            errors.append(f"Row {idx} ({slug}): gender must be a list")
        else:
            for g in gender:
                if g not in ("male", "female", "transgender", "other"):
                    warnings.append(f"Row {idx} ({slug}): unusual gender value: {g}")

        # Categories/Caste check
        caste = elig.get("categories")
        if not isinstance(caste, list):
            errors.append(f"Row {idx} ({slug}): categories must be a list")

        # URLs
        source_url = s.get("source_url")
        official_url = s.get("application", {}).get("official_url")
        if official_url and (official_url.startswith("http://") or official_url.startswith("https://")):
            valid_urls_count += 1
        else:
            warnings.append(f"Row {idx} ({slug}): official_url not valid HTTP/HTTPS: {official_url}")

        # Benefits & Documents
        benefits = s.get("benefits")
        if not isinstance(benefits, list) or len(benefits) == 0:
            warnings.append(f"Row {idx} ({slug}): empty benefits list")

        docs = s.get("documents")
        if not isinstance(docs, list) or len(docs) == 0:
            warnings.append(f"Row {idx} ({slug}): empty documents list")

    print("=" * 60)
    print("VALIDATION RESULTS SUMMARY")
    print("=" * 60)
    print(f"Total schemes validated:               {total_schemes}")
    print(f"Unique slugs:                          {len(seen_slugs)}")
    print(f"Duplicate slugs:                       {slug_duplicates}")
    print(f"Schemes with valid HTTP/S URLs:        {valid_urls_count} / {total_schemes} ({valid_urls_count/total_schemes*100:.1f}%)")
    print(f"Schemes with age criteria:             {age_constrained_count}")
    print(f"Schemes with income criteria:          {income_constrained_count}")
    print(f"Schemes marked 'third_party_dataset':  {third_party_verified_count} / {total_schemes}")
    print(f"Schemes marked 'eligibility_verified: False': {eligibility_unverified_count} / {total_schemes}")
    print(f"Total Warnings:                        {len(warnings)}")
    print(f"Total Errors:                          {len(errors)}")

    if errors:
        print("\nERRORS DETECTED (first 10):")
        for err in errors[:10]:
            print(f"  - {err}")
        print("\nVALIDATION FAILED!")
        return False
    else:
        print("\nALL INTEGRITY AND SCHEMA CHECKS PASSED SUCCESSFULLY!")
        return True


if __name__ == "__main__":
    success = validate_schemes()
    exit(0 if success else 1)

