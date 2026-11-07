#!/usr/bin/env python3
"""
Inspect the Indian Government Schemes CSV dataset in backend/data/.
Analyzes columns, data types, missing values, duplicates, and eligibility rules.
"""

import os
import csv
import json
from pathlib import Path
from collections import Counter

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "backend" / "data"


def find_csv_file() -> Path:
    """Automatically identify the CSV dataset in backend/data/."""
    csv_files = list(DATA_DIR.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV file found in {DATA_DIR}")
    return csv_files[0]


def inspect_dataset():
    csv_path = find_csv_file()
    print("=" * 70)
    print(f"INSPECTING DATASET: {csv_path.name}")
    print(f"Path: {csv_path}")
    print(f"File size: {csv_path.stat().st_size / (1024*1024):.2f} MB")
    print("=" * 70)

    total_rows = 0
    column_counts = Counter()
    empty_counts = Counter()
    slugs = set()
    duplicate_slugs = []
    names = set()
    duplicate_names = []

    age_anomalies = []
    income_anomalies = []

    gender_dist = Counter()
    caste_dist = Counter()
    bpl_dist = Counter()
    disability_dist = Counter()
    residence_dist = Counter()
    state_dist = Counter()
    category_dist = Counter()
    beneficiary_dist = Counter()

    with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames

        for idx, row in enumerate(reader, start=1):
            total_rows += 1
            slug = row.get("slug", "").strip()
            name = row.get("name", "").strip()

            # Duplicate check
            if slug in slugs:
                duplicate_slugs.append((idx, slug))
            else:
                slugs.add(slug)

            if name in names:
                duplicate_names.append((idx, name))
            else:
                names.add(name)

            # Field presence
            for field in fieldnames:
                val = row.get(field, "")
                if val is not None and val.strip() != "" and val.strip().lower() != "null":
                    column_counts[field] += 1
                else:
                    empty_counts[field] += 1

            # Categorical distributions
            g = row.get("eligibility_gender", "").strip().lower()
            if g and g != "null":
                gender_dist[g] += 1

            c = row.get("eligibility_caste", "").strip()
            if c and c != "null":
                caste_dist[c] += 1

            bpl = row.get("eligibility_bpl", "").strip().lower()
            if bpl and bpl != "null":
                bpl_dist[bpl] += 1

            dis = row.get("eligibility_disability", "").strip().lower()
            if dis and dis != "null":
                disability_dist[dis] += 1

            res = row.get("eligibility_residence", "").strip().lower()
            if res and res != "null":
                residence_dist[res] += 1

            st = row.get("state", "").strip()
            if st and st != "null":
                state_dist[st] += 1

            cats = row.get("category", "").split(",")
            for cat in cats:
                cat_clean = cat.strip()
                if cat_clean and cat_clean.lower() != "null":
                    category_dist[cat_clean] += 1

            bt = row.get("beneficiary_type", "").strip()
            if bt and bt != "null":
                beneficiary_dist[bt] += 1

            # Age checks
            amin_str = row.get("eligibility_age_min", "").strip()
            amax_str = row.get("eligibility_age_max", "").strip()
            fmin = None
            fmax = None
            if amin_str and amin_str.lower() != "null":
                try:
                    fmin = float(amin_str)
                    if fmin < 0 or fmin > 120:
                        age_anomalies.append((idx, slug, f"Age min out of range: {fmin}"))
                except ValueError:
                    age_anomalies.append((idx, slug, f"Invalid age min string: {amin_str}"))

            if amax_str and amax_str.lower() != "null":
                try:
                    fmax = float(amax_str)
                    if fmax <= 0 or fmax > 120:
                        age_anomalies.append((idx, slug, f"Age max invalid: {fmax}"))
                except ValueError:
                    age_anomalies.append((idx, slug, f"Invalid age max string: {amax_str}"))

            if fmin is not None and fmax is not None and fmin > fmax:
                age_anomalies.append((idx, slug, f"Age min ({fmin}) > Age max ({fmax})"))

            # Income checks
            inc_str = row.get("eligibility_income_max", "").strip()
            if inc_str and inc_str.lower() != "null":
                try:
                    finc = float(inc_str)
                    if finc < 0:
                        income_anomalies.append((idx, slug, f"Negative income max: {finc}"))
                except ValueError:
                    income_anomalies.append((idx, slug, f"Invalid income string: {inc_str}"))

    report = {
        "dataset_filename": csv_path.name,
        "total_records": total_rows,
        "total_columns": len(fieldnames),
        "columns": fieldnames,
        "unique_slugs": len(slugs),
        "duplicate_slug_count": len(duplicate_slugs),
        "unique_names": len(names),
        "duplicate_name_count": len(duplicate_names),
        "column_statistics": {
            f: {
                "present": column_counts[f],
                "missing": empty_counts[f],
                "coverage_pct": round(column_counts[f] * 100.0 / total_rows, 2),
            }
            for f in fieldnames
        },
        "age_anomalies_count": len(age_anomalies),
        "age_anomalies_sample": age_anomalies[:5],
        "income_anomalies_count": len(income_anomalies),
        "gender_distribution": dict(gender_dist.most_common(10)),
        "caste_distribution": dict(caste_dist.most_common(10)),
        "bpl_distribution": dict(bpl_dist.most_common(5)),
        "disability_distribution": dict(disability_dist.most_common(5)),
        "residence_distribution": dict(residence_dist.most_common(5)),
        "top_states": dict(state_dist.most_common(10)),
        "top_categories": dict(category_dist.most_common(10)),
    }

    print(json.dumps(report, indent=2))
    return report


if __name__ == "__main__":
    inspect_dataset()

