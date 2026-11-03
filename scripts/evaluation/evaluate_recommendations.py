import json
import sys
from pathlib import Path
from typing import Dict, Any, List

# Add workspace root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.schemas.user import UserProfile
from app.recommendation.engine import generate_recommendations
from app.repositories.scheme_repository import scheme_repository
from scripts.seed_schemes import SEED_SCHEMES

DATASET_PATH = Path(__file__).resolve().parent / "dataset.json"

STATUS_TIER_MAP = {
    "ELIGIBLE": 1,
    "INSUFFICIENT INFORMATION": 2,
    "NOT ELIGIBLE": 3,
}


def ensure_schemes_loaded():
    """Ensure in-memory scheme repository is populated for offline evaluation."""
    for s in SEED_SCHEMES:
        if s["slug"] not in scheme_repository._in_memory_schemes:
            scheme_dict = s.copy()
            scheme_dict["_id"] = s["slug"]
            scheme_repository._in_memory_schemes[s["slug"]] = scheme_dict


def run_recommendation_evaluation() -> Dict[str, Any]:
    """Evaluate deterministic recommendation ranking engine monotonicity and tier preservation."""
    ensure_schemes_loaded()

    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    test_cases = dataset["test_cases"]

    total_recommendation_runs = 0
    tier_order_preserved_count = 0
    score_monotonicity_preserved_count = 0
    archived_exclusion_count = 0

    ranking_failures: List[Dict[str, Any]] = []

    # Get unique profiles from dataset
    seen_profiles = []
    for tc in test_cases:
        p_dict = tc["profile"]
        if p_dict not in seen_profiles:
            seen_profiles.append(p_dict)

    for idx, p_dict in enumerate(seen_profiles):
        total_recommendation_runs += 1
        profile = UserProfile(**p_dict)

        rec_res = generate_recommendations(profile=profile, limit=50)
        results = rec_res["results"]

        # 1. Check Tier Ordering (Tier 1 < Tier 2 < Tier 3)
        tier_violations = 0
        current_max_tier = 1
        for item in results:
            item_tier = STATUS_TIER_MAP.get(item["status"], 3)
            if item_tier < current_max_tier:
                tier_violations += 1
            else:
                current_max_tier = max(current_max_tier, item_tier)

        if tier_violations == 0:
            tier_order_preserved_count += 1
        else:
            ranking_failures.append({
                "profile_index": idx,
                "reason": "Tier order violation",
                "violations": tier_violations,
            })

        # 2. Check Match Score Monotonicity within ELIGIBLE Tier
        eligible_items = [r for r in results if r["status"] == "ELIGIBLE"]
        monotonicity_violations = 0
        for i in range(len(eligible_items) - 1):
            score1 = eligible_items[i]["match_score"] or 0
            score2 = eligible_items[i + 1]["match_score"] or 0
            if score1 < score2:
                monotonicity_violations += 1

        if monotonicity_violations == 0:
            score_monotonicity_preserved_count += 1

        # 3. Check Archived Exclusion
        archived_found = [r for r in results if r["scheme"].get("status") == "archived"]
        if len(archived_found) == 0:
            archived_exclusion_count += 1

    tier_preservation_rate = (tier_order_preserved_count / total_recommendation_runs) if total_recommendation_runs > 0 else 0.0
    monotonicity_rate = (score_monotonicity_preserved_count / total_recommendation_runs) if total_recommendation_runs > 0 else 0.0
    archived_exclusion_rate = (archived_exclusion_count / total_recommendation_runs) if total_recommendation_runs > 0 else 0.0

    return {
        "unique_profiles_evaluated": total_recommendation_runs,
        "tier_preservation_rate": round(tier_preservation_rate, 4),
        "score_monotonicity_rate": round(monotonicity_rate, 4),
        "archived_exclusion_rate": round(archived_exclusion_rate, 4),
        "ranking_failures": ranking_failures,
    }


if __name__ == "__main__":
    res = run_recommendation_evaluation()
    print("=== DETERMINISTIC RECOMMENDATION RANKING EVALUATION ===")
    print(f"Profiles Evaluated: {res['unique_profiles_evaluated']}")
    print(f"Tier Order Preservation Rate: {res['tier_preservation_rate'] * 100:.2f}%")
    print(f"Match Score Monotonicity Rate: {res['score_monotonicity_rate'] * 100:.2f}%")
    print(f"Archived Exclusion Compliance: {res['archived_exclusion_rate'] * 100:.2f}%")
