import asyncio
import json
import sys
from pathlib import Path
from typing import Dict, Any, List

# Add workspace root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.schemas.user import UserProfile
from app.schemas.ai import NaturalLanguageProfileInput
from app.ai.service import ai_service
from app.eligibility.engine import evaluate_scheme
from app.repositories.scheme_repository import scheme_repository
from scripts.seed_schemes import SEED_SCHEMES

DATASET_PATH = Path(__file__).resolve().parent / "dataset.json"

CHECKED_FIELDS = [
    "age", "state", "annual_income", "occupation", 
    "education", "category", "is_student", "is_farmer", "is_disabled"
]


def ensure_schemes_loaded():
    """Ensure in-memory scheme repository is populated for offline evaluation."""
    for s in SEED_SCHEMES:
        if s["slug"] not in scheme_repository._in_memory_schemes:
            scheme_dict = s.copy()
            scheme_dict["_id"] = s["slug"]
            scheme_repository._in_memory_schemes[s["slug"]] = scheme_dict


async def run_ai_extraction_evaluation() -> Dict[str, Any]:
    """Evaluate AI natural-language profile extraction and end-to-end eligibility agreement."""
    ensure_schemes_loaded()

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    test_cases = dataset["test_cases"]
    total_cases = len(test_cases)

    total_field_checks = 0
    correct_field_extractions = 0

    total_missing_checks = 0
    correct_missing_detections = 0

    agreed_eligibility_outcomes = 0

    extraction_failures: List[Dict[str, Any]] = []

    for tc in test_cases:
        tc_id = tc["id"]
        text = tc["natural_language_text"]
        gt_profile = tc["profile"]
        scheme_slug = tc["scheme_slug"]

        inp = NaturalLanguageProfileInput(text=text)
        res = await ai_service.parse_profile_from_text(inp)
        extracted_prof = res.extracted_profile.model_dump()

        # 1. Field extraction & missing field accuracy
        case_field_errors = []
        for field in CHECKED_FIELDS:
            gt_val = gt_profile.get(field)
            ext_val = extracted_prof.get(field)

            total_field_checks += 1
            if gt_val == ext_val:
                correct_field_extractions += 1
            else:
                case_field_errors.append({
                    "field": field,
                    "expected": gt_val,
                    "extracted": ext_val
                })

            if gt_val is None:
                total_missing_checks += 1
                if ext_val is None:
                    correct_missing_detections += 1

        # 2. End-to-end Eligibility Result Agreement
        scheme = scheme_repository.get_by_slug(scheme_slug) or scheme_repository.get_by_id(scheme_slug) or {
            "name": scheme_slug,
            "slug": scheme_slug,
            "eligibility": {},
            "status": "active"
        }

        # Status using GT structured profile
        gt_eval = evaluate_scheme(UserProfile(**gt_profile), scheme)
        # Status using AI extracted profile
        ai_eval = evaluate_scheme(res.extracted_profile, scheme)

        if gt_eval["status"] == ai_eval["status"]:
            agreed_eligibility_outcomes += 1
        else:
            extraction_failures.append({
                "id": tc_id,
                "text": text,
                "gt_status": gt_eval["status"],
                "ai_extracted_status": ai_eval["status"],
                "field_errors": case_field_errors,
            })

    field_accuracy = (correct_field_extractions / total_field_checks) if total_field_checks > 0 else 0.0
    missing_detection_accuracy = (correct_missing_detections / total_missing_checks) if total_missing_checks > 0 else 0.0
    eligibility_agreement = (agreed_eligibility_outcomes / total_cases) if total_cases > 0 else 0.0

    return {
        "provider_used": ai_service.provider.name,
        "is_mock_provider": ai_service.provider.name == "mock",
        "disclaimer": "52.22% field extraction accuracy and 80.00% end-to-end agreement are measured on the MOCK rule-based provider and do NOT represent live Google Gemini API performance.",
        "dataset_size": total_cases,
        "field_checks_total": total_field_checks,
        "field_extraction_accuracy": round(field_accuracy, 4),
        "missing_field_detection_accuracy": round(missing_detection_accuracy, 4),
        "eligibility_result_agreement": round(eligibility_agreement, 4),
        "failures": extraction_failures,
    }


if __name__ == "__main__":
    res = asyncio.run(run_ai_extraction_evaluation())
    print("=== AI PROFILE EXTRACTION EVALUATION ===")
    print(f"Provider Used: {res['provider_used']} (Mock Provider={res['is_mock_provider']})")
    print(f"Field Extraction Accuracy: {res['field_extraction_accuracy'] * 100:.2f}%")
    print(f"Missing Field Detection Accuracy: {res['missing_field_detection_accuracy'] * 100:.2f}%")
    print(f"End-to-End Eligibility Agreement: {res['eligibility_result_agreement'] * 100:.2f}%")
    print(f"Note: {res['disclaimer']}")
