#!/usr/bin/env python3
"""
Preprocess and clean the Indian Government Schemes CSV dataset.
Outputs:
  - backend/data/schemes_cleaned.json
  - backend/data/preprocessing_report.json
"""

import os
import csv
import json
import re
import html
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "backend" / "data"


def find_csv_file() -> Path:
    """Automatically identify the CSV dataset in backend/data/."""
    csv_files = list(DATA_DIR.glob("*.csv"))
    if not csv_files:
        raise FileNotFoundError(f"No CSV file found in {DATA_DIR}")
    return csv_files[0]


def fix_mojibake(text: Optional[str]) -> str:
    """Fix common cp1252/utf-8 mojibake encoding artifacts (e.g. Rupee symbol â‚¹ -> ₹)."""
    if not text:
        return ""
    text = str(text)
    # Check if text contains typical mojibake sequences
    if "â‚¹" in text or "â€" in text or "â€“" in text or "â€™" in text:
        try:
            return text.encode("cp1252").decode("utf-8")
        except Exception:
            # Fallback manual replacements if whole-string transcode fails
            replacements = {
                "â‚¹": "₹",
                "â€“": "–",
                "â€”": "—",
                "â€™": "'",
                "â€˜": "'",
                "â€œ": '"',
                "â€\x9d": '"',
                "â€¢": "•",
                "â€¦": "…",
            }
            for bad, good in replacements.items():
                text = text.replace(bad, good)
            return text
    return text


def clean_text(text: Optional[str]) -> str:
    """Clean markdown, HTML tags, HTML entities, and redundant whitespace."""
    if not text:
        return ""
    text = fix_mojibake(text)
    if text.strip().lower() in ("null", "none", "nan", "na", "n/a"):
        return ""
    # Unescape HTML entities (e.g. &amp;, &#39;, &gt;)
    try:
        text = html.unescape(html.unescape(text))
    except Exception:
        pass
    # Replace html breaks with newlines
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Remove consecutive spaces
    text = re.sub(r"[ \t]+", " ", text)
    cleaned = text.strip()
    if cleaned.lower() in ("null", "none", "nan", "na", "n/a"):
        return ""
    return cleaned


def parse_clean_list(raw_text: Optional[str]) -> List[str]:
    """Parse bullet points, markdown lists, or comma-separated lines into a list of strings."""
    if not raw_text:
        return []
    cleaned = clean_text(raw_text)
    if not cleaned or cleaned.lower() in ("null", "none", "nan", "na", "n/a", "[]"):
        return []

    lines = [line.strip() for line in cleaned.split("\n") if line.strip()]
    items = []
    for line in lines:
        # Remove bullet markers like *, -, 1., 2., •
        subline = re.sub(r"^(\*|\-|\•|\d+\.)\s+", "", line).strip()
        # Remove markdown bold/italic asterisks around the whole item
        subline = re.sub(r"^\*+|\*+$", "", subline).strip()
        if subline and subline.lower() not in ("null", "none", "nan", "na", "n/a", "[]"):
            items.append(subline)

    if not items and cleaned and cleaned.lower() not in ("null", "none", "nan", "na", "n/a", "[]"):
        items = [cleaned]
    return items


def normalize_categories(raw_category: Optional[str]) -> List[str]:
    """Normalize comma-separated category string into standard slug-friendly categories."""
    if not raw_category:
        return ["general"]
    raw_category = fix_mojibake(raw_category)
    cat_parts = [c.strip() for c in raw_category.split(",") if c.strip()]
    normalized = []
    category_map = {
        "agriculture": "agriculture",
        "rural & environment": "rural_environment",
        "rural": "rural_environment",
        "social welfare & empowerment": "social_welfare",
        "social welfare": "social_welfare",
        "education & learning": "education",
        "education": "education",
        "business & entrepreneurship": "business_entrepreneurship",
        "business": "business_entrepreneurship",
        "women and child": "women_child",
        "skills & employment": "skills_employment",
        "banking": "banking_financial",
        "financial services and insurance": "banking_financial",
        "health & wellness": "health",
        "health": "health",
        "sports & culture": "sports_culture",
        "housing & shelter": "housing",
        "housing": "housing",
        "science": "science_technology",
        "it & communications": "it_technology",
        "transport & infrastructure": "transport_infrastructure",
        "utility & sanitation": "sanitation_utility",
        "travel & tourism": "tourism",
        "public safety, law & justice": "law_justice",
    }

    for part in cat_parts:
        part_lower = part.lower().strip()
        mapped = category_map.get(part_lower)
        if mapped and mapped not in normalized:
            normalized.append(mapped)
        elif not mapped:
            slugified = re.sub(r"[^a-z0-9]+", "_", part_lower).strip("_")
            if slugified and slugified not in normalized:
                normalized.append(slugified)

    return normalized or ["general"]


def normalize_name(raw_name: Optional[str]) -> str:
    """Normalize scheme name, stripping redundant quotes and spacing."""
    if not raw_name:
        return "Unnamed Scheme"
    name = fix_mojibake(raw_name)
    name = re.sub(r'^\s*["“”\']+|["“”\']+\s*$', "", name)
    name = re.sub(r'\s*""\s*', '"', name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def normalize_state(raw_state: Optional[str]) -> Tuple[str, List[str]]:
    """Determine government level ('central' or 'state') and allowed states list."""
    if not raw_state or raw_state.strip().lower() in ("central", "all", "pan india", "null"):
        return "central", []
    state_clean = raw_state.strip()
    return "state", [state_clean]


def parse_caste(raw_caste: Optional[str]) -> List[str]:
    """Parse JSON caste string like '[\"SC\", \"ST\"]' into lowercase list."""
    if not raw_caste or raw_caste.strip().lower() in ("null", "none", "[]"):
        return []
    try:
        parsed = json.loads(raw_caste)
        if isinstance(parsed, list):
            return [str(c).strip().lower() for c in parsed if str(c).strip()]
    except Exception:
        pass
    return []


def parse_numeric(val: Optional[str]) -> Optional[float]:
    """Safely parse numeric value without converting missing to 0."""
    if val is None:
        return None
    val_str = str(val).strip().lower()
    if val_str in ("", "null", "none", "na", "n/a"):
        return None
    try:
        return float(val_str)
    except ValueError:
        return None


def preprocess_dataset() -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    csv_path = find_csv_file()
    print(f"Reading dataset: {csv_path.name}...")

    cleaned_records = []
    seen_slugs = set()
    duplicate_records = []
    invalid_records = []
    records_incomplete_eligibility = 0
    records_manual_verification = 0

    total_records = 0

    with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=1):
            total_records += 1

            # 1. Slug & Uniqueness
            slug = row.get("slug", "").strip()
            if not slug:
                slug = f"scheme-{idx}"
            if slug in seen_slugs:
                duplicate_records.append({
                    "row_index": idx,
                    "slug": slug,
                    "name": row.get("name", ""),
                    "reason": "Duplicate slug found in dataset",
                })
                # Disambiguate slug so valid records aren't dropped
                slug = f"{slug}-dup-{idx}"
            seen_slugs.add(slug)

            # 2. Names & Descriptions
            name = normalize_name(row.get("name"))
            desc = clean_text(row.get("description"))
            if not desc or len(desc) < 5:
                desc = f"Government welfare and development initiative: {name}"

            # 3. Government & State
            gov_level, states = normalize_state(row.get("state"))
            dept = clean_text(row.get("department"))
            ministry = clean_text(row.get("ministry"))
            primary_dept = dept or ministry or (f"Government of {states[0]}" if states else "Central Government")

            # 4. Categories
            categories = normalize_categories(row.get("category"))

            # 5. Eligibility Normalization
            age_min_raw = parse_numeric(row.get("eligibility_age_min"))
            age_max_raw = parse_numeric(row.get("eligibility_age_max"))
            income_max_raw = parse_numeric(row.get("eligibility_income_max"))
            gender_raw = row.get("eligibility_gender", "").strip().lower()
            caste_list = parse_caste(row.get("eligibility_caste"))
            bpl_raw = row.get("eligibility_bpl", "").strip().lower()
            disability_raw = row.get("eligibility_disability", "").strip().lower()
            residence_raw = row.get("eligibility_residence", "").strip().lower()
            elig_text = clean_text(row.get("eligibility_text"))

            flags = []

            # Age validation
            age_min = int(age_min_raw) if age_min_raw is not None else None
            age_max = int(age_max_raw) if age_max_raw is not None else None

            if age_min is not None and (age_min < 0 or age_min > 120):
                flags.append(f"Invalid age_min: {age_min}")
                age_min = None

            if age_max is not None:
                if age_max == 0:
                    flags.append("Infant/Newborn scheme (age_max=0)")
                elif age_max < 0 or age_max > 120:
                    flags.append(f"Invalid age_max: {age_max}")
                    age_max = None

            if age_min is not None and age_max is not None and age_min > age_max:
                flags.append(f"Age conflict: min ({age_min}) > max ({age_max})")
                age_min = None
                age_max = None
                records_manual_verification += 1

            # Income validation
            income_max = income_max_raw if income_max_raw is not None and income_max_raw > 0 else None
            if income_max_raw is not None and income_max_raw <= 0:
                flags.append(f"Invalid income_max: {income_max_raw}")
                income_max = None

            # Gender mapping
            genders = []
            if gender_raw == "female":
                genders = ["female"]
            elif gender_raw == "male":
                genders = ["male"]
            # "all" -> empty list (matches all genders in recommendation engine)

            # Disability flag
            is_disabled = True if disability_raw == "true" else None

            # BPL flag
            bpl_required = True if bpl_raw == "true" else None

            # Rural/Urban residence
            rural_urban = residence_raw if residence_raw in ("rural", "urban", "both") else None

            # Check if eligibility conditions are incomplete
            is_incomplete = (
                age_min is None
                and age_max is None
                and income_max is None
                and not caste_list
                and not genders
                and is_disabled is None
                and bpl_required is None
            )
            if is_incomplete:
                records_incomplete_eligibility += 1
                flags.append("Incomplete structured eligibility criteria (relies on raw text)")

            # Beneficiary type / Occupations
            ben_type = clean_text(row.get("beneficiary_type"))
            occupations = []
            is_farmer = None
            is_student = None

            ben_lower = (ben_type + " " + desc + " " + name).lower()
            if "farmer" in ben_lower or "agriculture" in categories:
                if "farmer" in ben_type.lower():
                    is_farmer = True
                    occupations.append("farmer")
            if "student" in ben_lower or "education" in categories:
                if "student" in ben_type.lower():
                    is_student = True
                    occupations.append("student")
            if "artisan" in ben_lower or "craftsman" in ben_lower:
                occupations.append("artisan")

            # 6. Benefits & Documents
            benefits_list = parse_clean_list(row.get("benefits"))
            if not benefits_list:
                benefits_list = ["Financial and welfare support according to government scheme guidelines."]

            documents_list = parse_clean_list(row.get("documents_required"))
            if not documents_list:
                documents_list = ["Aadhaar Card", "Identity Proof", "Resident Certificate"]

            # 7. Application & Sources
            apply_url = row.get("apply_url", "").strip()
            official_url = row.get("official_url", "").strip()
            if not official_url or official_url.lower() == "null":
                official_url = apply_url or f"https://www.myscheme.gov.in/schemes/{slug}"
            if not apply_url or apply_url.lower() == "null":
                apply_url = official_url

            scraped_at = row.get("scraped_at", "").strip()
            last_verified = scraped_at[:10] if scraped_at and len(scraped_at) >= 10 else None

            app_steps = parse_clean_list(row.get("application_process"))

            # Assemble Standardized Scheme Schema
            cleaned_scheme = {
                "name": name,
                "scheme_name": name,
                "slug": slug,
                "description": desc,
                "category": categories,
                "government": {
                    "level": gov_level,
                    "department": primary_dept,
                    "ministry": ministry or None,
                },
                "government_level": gov_level,
                "state": states,
                "eligibility": {
                    "age": {
                        "min": age_min,
                        "max": age_max,
                    },
                    "min_age": age_min,
                    "max_age": age_max,
                    "income": {
                        "min": None,
                        "max": income_max,
                    },
                    "annual_income_max": income_max,
                    "states": states,
                    "districts": [],
                    "occupations": occupations,
                    "education": [],
                    "gender": genders,
                    "categories": caste_list,
                    "caste": caste_list,
                    "is_farmer": is_farmer,
                    "is_student": is_student,
                    "is_disabled": is_disabled,
                    "bpl_required": bpl_required,
                    "rural_urban": rural_urban,
                    "raw_text": elig_text,
                },
                "benefits": benefits_list,
                "documents": documents_list,
                "documents_required": documents_list,
                "application": {
                    "method": "online" if apply_url.startswith("http") else "offline",
                    "steps": app_steps,
                    "official_url": official_url,
                },
                "application_url": apply_url,
                "source": {
                    "department": primary_dept,
                    "source_url": official_url,
                    "last_verified": last_verified or "2024-05-18",
                },
                "source_url": official_url,
                "source_type": "third_party_dataset",
                "eligibility_verified": False,
                "status": "active",
                "is_demo_data": False,
                "verification_flags": flags,
            }

            cleaned_records.append(cleaned_scheme)

    # Compile Preprocessing Report
    report = {
        "dataset_filename": csv_path.name,
        "original_record_count": total_records,
        "successfully_processed_records": len(cleaned_records),
        "duplicate_records": len(duplicate_records),
        "duplicate_records_details": duplicate_records,
        "invalid_records": len(invalid_records),
        "records_with_incomplete_eligibility": records_incomplete_eligibility,
        "records_requiring_manual_verification": records_manual_verification,
        "records_ready_for_import": len(cleaned_records),
        "field_mapping_details": {
            "slug": "slug (unique identifier, disambiguated if duplicate)",
            "name": "name & scheme_name (normalized, unquoted, mojibake-free)",
            "description": "description (cleaned text)",
            "category": "category (normalized list: e.g. agriculture, education, social_welfare)",
            "state": "government.level ('central' or 'state') and eligibility.states",
            "department / ministry": "government.department & source.department",
            "eligibility_age_min / max": "eligibility.age.min and eligibility.age.max",
            "eligibility_income_max": "eligibility.income.max and eligibility.annual_income_max",
            "eligibility_gender": "eligibility.gender (['female'], ['male'], or [] for all)",
            "eligibility_caste": "eligibility.categories (['sc', 'st', ...])",
            "eligibility_disability": "eligibility.is_disabled (True / None)",
            "eligibility_bpl": "eligibility.bpl_required (True / None)",
            "eligibility_residence": "eligibility.rural_urban ('rural', 'urban', 'both')",
            "benefits": "benefits (cleaned list of benefit items)",
            "documents_required": "documents & documents_required (cleaned list of documents)",
            "official_url / apply_url": "application.official_url, application_url & source_url",
            "scraped_at": "source.last_verified (ISO date: 2024-05-18)",
            "source_type": "third_party_dataset",
            "eligibility_verified": "false (strict requirement: unverified third-party dataset)",
        },
    }

    # Save Cleaned JSON
    output_cleaned_path = DATA_DIR / "schemes_cleaned.json"
    with open(output_cleaned_path, "w", encoding="utf-8") as f:
        json.dump(cleaned_records, f, indent=2, ensure_ascii=False)
    print(f"Saved cleaned schemes dataset to: {output_cleaned_path}")

    # Save Preprocessing Report
    output_report_path = DATA_DIR / "preprocessing_report.json"
    with open(output_report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"Saved preprocessing report to: {output_report_path}")

    return cleaned_records, report


if __name__ == "__main__":
    preprocess_dataset()
