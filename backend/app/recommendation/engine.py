from typing import Dict, Any, List, Optional
from app.schemas.user import UserProfile
from app.schemas.scheme import SchemeResponse
from app.eligibility.engine import evaluate_scheme
from app.repositories.scheme_repository import scheme_repository


def generate_recommendation_reason(
    status: str,
    scheme_name: str,
    matched: List[str],
    failed: List[str],
    missing: List[str],
) -> str:
    """Generate human-readable explanation for why scheme appears in recommendation results."""
    if status == "ELIGIBLE":
        if matched:
            key_matches = "; ".join(matched[:2])
            return f"You satisfy all eligibility criteria for {scheme_name} ({key_matches})."
        return f"You satisfy all eligibility criteria for {scheme_name}."

    elif status == "INSUFFICIENT INFORMATION":
        fields_str = "; ".join(missing[:2])
        return f"You may qualify for {scheme_name}. Required information needed to verify: {fields_str}."

    else:  # NOT ELIGIBLE
        fail_str = "; ".join(failed[:2])
        return f"Currently ineligible for {scheme_name} due to: {fail_str}."


def generate_recommendations(
    profile: UserProfile,
    candidate_schemes: Optional[List[Dict[str, Any]]] = None,
    preferred_categories: Optional[List[str]] = None,
    limit: int = 50,
    tier_limit: Optional[int] = 100,
) -> Dict[str, Any]:
    """
    Deterministic Recommendation & Multi-Tier Ranking Engine.
    
    Ranking Principles:
    1. Tier 1: ELIGIBLE schemes (Ranked by match_score DESC, category relevance DESC, slug ASC)
    2. Tier 2: INSUFFICIENT INFORMATION schemes (Ranked by len(missing) ASC, len(matched) DESC, slug ASC)
    3. Tier 3: NOT ELIGIBLE schemes (Ranked by match_score DESC, len(failed) ASC, slug ASC)
    
    Archives/inactive schemes are strictly excluded.
    """
    if candidate_schemes is None:
        # Fetch active schemes only (excluding archived and inactive)
        candidate_schemes = scheme_repository.list_schemes(
            query={"status": "active"},
            skip=0,
            limit=10000,
        )

    # Filter out any non-active schemes explicitly
    active_schemes = [
        s for s in candidate_schemes if s.get("status") == "active"
    ]

    # Category preference set
    pref_cats = [c.lower() for c in (preferred_categories or [])]

    evaluated_items = []

    for scheme in active_schemes:
        eval_res = evaluate_scheme(profile, scheme)

        status_str = eval_res["status"]
        scheme_slug = eval_res["scheme_slug"]
        scheme_name = eval_res["scheme_name"]

        # Category relevance count
        scheme_cats = [c.lower() for c in scheme.get("category", [])]
        cat_relevance = sum(1 for c in pref_cats if c in scheme_cats)

        reason = generate_recommendation_reason(
            status=status_str,
            scheme_name=scheme_name,
            matched=eval_res["matched_conditions"],
            failed=eval_res["failed_conditions"],
            missing=eval_res["missing_information"],
        )

        item = {
            "scheme": scheme,
            "scheme_id": eval_res["scheme_id"],
            "scheme_slug": scheme_slug,
            "scheme_name": scheme_name,
            "status": status_str,
            "eligible": eval_res["eligible"],
            "is_insufficient_info": eval_res["is_insufficient_info"],
            "match_score": eval_res["match_score"],
            "recommendation_reason": reason,
            "matched_conditions": eval_res["matched_conditions"],
            "failed_conditions": eval_res["failed_conditions"],
            "missing_information": eval_res["missing_information"],
            "evaluation_details": eval_res["evaluation_details"],
            "_cat_relevance": cat_relevance,
        }
        evaluated_items.append(item)

    # Separate into 3 Tiers
    tier1_eligible = [i for i in evaluated_items if i["status"] == "ELIGIBLE"]
    tier2_insufficient = [i for i in evaluated_items if i["status"] == "INSUFFICIENT INFORMATION"]
    tier3_ineligible = [i for i in evaluated_items if i["status"] == "NOT ELIGIBLE"]

    # Tier 1 Sorting: verified authoritative first, match_score DESC, matched_conditions count DESC, cat_relevance DESC, slug ASC
    tier1_eligible.sort(
        key=lambda x: (
            0 if x["scheme"].get("eligibility_verified") is not False else 1,
            -(x["match_score"] or 0),
            -len(x["matched_conditions"]),
            -x["_cat_relevance"],
            x["scheme_slug"],
        )
    )

    # Tier 2 Sorting: verified authoritative first, missing_count ASC, matched_count DESC, slug ASC
    tier2_insufficient.sort(
        key=lambda x: (
            0 if x["scheme"].get("eligibility_verified") is not False else 1,
            len(x["missing_information"]),
            -len(x["matched_conditions"]),
            x["scheme_slug"],
        )
    )

    # Tier 3 Sorting: verified authoritative first, match_score DESC, failed_count ASC, slug ASC
    tier3_ineligible.sort(
        key=lambda x: (
            0 if x["scheme"].get("eligibility_verified") is not False else 1,
            -(x["match_score"] or 0),
            len(x["failed_conditions"]),
            x["scheme_slug"],
        )
    )

    # Combine Tiers: ELIGIBLE -> INSUFFICIENT INFORMATION -> NOT ELIGIBLE
    combined = []
    current_rank = 1
    for tier_list in [tier1_eligible, tier2_insufficient, tier3_ineligible]:
        for item in tier_list:
            clean_item = item.copy()
            clean_item.pop("_cat_relevance", None)
            clean_item["rank"] = current_rank
            combined.append(clean_item)
            current_rank += 1

    ranked_results = combined[:limit]

    # For each tier, populate grouped results up to tier_limit (default 200, or all if tier_limit is None)
    t_limit = tier_limit or 200
    grouped = {
        "eligible": [i for i in combined if i["status"] == "ELIGIBLE"][:t_limit],
        "insufficient_information": [i for i in combined if i["status"] == "INSUFFICIENT INFORMATION"][:t_limit],
        "not_eligible": [i for i in combined if i["status"] == "NOT ELIGIBLE"][:t_limit],
    }

    return {
        "total_evaluated": len(active_schemes),
        "eligible_count": len(tier1_eligible),
        "insufficient_info_count": len(tier2_insufficient),
        "not_eligible_count": len(tier3_ineligible),
        "results": ranked_results,
        "grouped": grouped,
    }
