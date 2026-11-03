from typing import Dict, Any, List, Union, Optional
from app.schemas.user import UserProfile
from app.schemas.scheme import SchemeBase, EligibilityRules, AgeRule, IncomeRule
from app.eligibility.evaluators import (
    evaluate_age,
    evaluate_income,
    evaluate_state,
    evaluate_occupation,
    evaluate_education,
    evaluate_gender,
    evaluate_category,
    evaluate_boolean_flag,
)


def evaluate_scheme(
    profile: UserProfile, scheme: Union[Dict[str, Any], SchemeBase]
) -> Dict[str, Any]:
    """
    Central Deterministic Eligibility Evaluation Engine.
    Produces three authoritative outcomes:
    1. ELIGIBLE
    2. NOT ELIGIBLE
    3. INSUFFICIENT INFORMATION
    """
    if isinstance(scheme, SchemeBase):
        rules = scheme.eligibility
        scheme_id = getattr(scheme, "id", scheme.slug)
        scheme_slug = scheme.slug
        scheme_name = scheme.name
    else:
        elig_dict = scheme.get("eligibility", {})
        age_dict = elig_dict.get("age") or {}
        income_dict = elig_dict.get("income") or {}

        rules = EligibilityRules(
            age=AgeRule(min=age_dict.get("min"), max=age_dict.get("max")),
            income=IncomeRule(min=income_dict.get("min"), max=income_dict.get("max")),
            states=elig_dict.get("states") or [],
            districts=elig_dict.get("districts") or [],
            occupations=elig_dict.get("occupations") or [],
            education=elig_dict.get("education") or [],
            gender=elig_dict.get("gender") or [],
            categories=elig_dict.get("categories") or [],
            is_farmer=elig_dict.get("is_farmer"),
            is_student=elig_dict.get("is_student"),
            is_disabled=elig_dict.get("is_disabled"),
        )
        scheme_id = str(scheme.get("_id", scheme.get("slug")))
        scheme_slug = str(scheme.get("slug", scheme_id))
        scheme_name = scheme.get("name", "Unknown Scheme")

    evaluations = [
        evaluate_age(profile.age, rules.age),
        evaluate_income(profile.annual_income, rules.income),
        evaluate_state(profile.state, rules.states),
        evaluate_occupation(profile.occupation, rules.occupations),
        evaluate_education(profile.education, rules.education),
        evaluate_gender(profile.gender, rules.gender),
        evaluate_category(profile.category, rules.categories),
        evaluate_boolean_flag(profile.is_farmer, rules.is_farmer, "is_farmer"),
        evaluate_boolean_flag(profile.is_student, rules.is_student, "is_student"),
        evaluate_boolean_flag(profile.is_disabled, rules.is_disabled, "is_disabled"),
    ]

    matched_conditions: List[str] = []
    failed_conditions: List[str] = []
    missing_information: List[str] = []
    applicable_count = 0
    passed_count = 0

    for ev in evaluations:
        st = ev["status"]
        if st == "not_applicable":
            continue

        applicable_count += 1
        if st == "passed":
            passed_count += 1
            matched_conditions.append(ev["message"])
        elif st == "failed":
            failed_conditions.append(ev["message"])
        elif st == "missing":
            missing_information.append(ev["message"])

    # Determine 3-State Outcome
    if len(failed_conditions) > 0:
        overall_status = "NOT ELIGIBLE"
        eligible = False
        is_insufficient_info = False
        match_score: Optional[int] = (
            round((passed_count / applicable_count) * 100) if applicable_count > 0 else 0
        )
    elif len(missing_information) > 0:
        overall_status = "INSUFFICIENT INFORMATION"
        eligible = False
        is_insufficient_info = True
        # Set match_score to None when required info is missing to avoid misleading scores
        match_score = None
    else:
        overall_status = "ELIGIBLE"
        eligible = True
        is_insufficient_info = False
        match_score = (
            round((passed_count / applicable_count) * 100) if applicable_count > 0 else 100
        )

    return {
        "scheme_id": scheme_id,
        "scheme_slug": scheme_slug,
        "scheme_name": scheme_name,
        "status": overall_status,
        "eligible": eligible,
        "is_insufficient_info": is_insufficient_info,
        "match_score": match_score,
        "matched_conditions": matched_conditions,
        "failed_conditions": failed_conditions,
        "missing_information": missing_information,
        "evaluation_details": evaluations,
    }
