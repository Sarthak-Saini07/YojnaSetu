from typing import Dict, Any, List, Optional
from app.schemas.scheme import AgeRule, IncomeRule


def evaluate_age(age: Optional[int], age_rule: Optional[AgeRule]) -> Dict[str, Any]:
    """Evaluate age against minimum and maximum boundaries."""
    if not age_rule or (age_rule.min is None and age_rule.max is None):
        return {"field": "age", "status": "not_applicable", "message": "No age restriction."}

    if age is None:
        return {"field": "age", "status": "missing", "message": "Age is required to determine eligibility."}

    if age_rule.min is not None and age < age_rule.min:
        return {
            "field": "age",
            "status": "failed",
            "message": f"Age ({age} years) is below minimum required age ({age_rule.min} years).",
        }

    if age_rule.max is not None and age > age_rule.max:
        return {
            "field": "age",
            "status": "failed",
            "message": f"Age ({age} years) exceeds maximum allowed age limit of {age_rule.max} years.",
        }

    return {
        "field": "age",
        "status": "passed",
        "message": f"Age requirement satisfied ({age} years).",
    }


def evaluate_income(annual_income: Optional[float], income_rule: Optional[IncomeRule]) -> Dict[str, Any]:
    """Evaluate annual family income against income thresholds."""
    if not income_rule or (income_rule.min is None and income_rule.max is None):
        return {"field": "income", "status": "not_applicable", "message": "No income restriction."}

    if annual_income is None:
        return {
            "field": "income",
            "status": "missing",
            "message": "Annual income is required to determine eligibility.",
        }

    if income_rule.min is not None and annual_income < income_rule.min:
        return {
            "field": "income",
            "status": "failed",
            "message": f"Annual income (₹{annual_income:,.0f}) is below minimum threshold (₹{income_rule.min:,.0f}).",
        }

    if income_rule.max is not None and annual_income > income_rule.max:
        return {
            "field": "income",
            "status": "failed",
            "message": f"Annual income (₹{annual_income:,.0f}) exceeds maximum allowed limit of ₹{income_rule.max:,.0f}.",
        }

    return {
        "field": "income",
        "status": "passed",
        "message": f"Annual income (₹{annual_income:,.0f}) is within scheme income limit.",
    }


def evaluate_state(state: Optional[str], allowed_states: List[str]) -> Dict[str, Any]:
    """Evaluate state of residence."""
    if not allowed_states:
        return {"field": "state", "status": "not_applicable", "message": "Applicable across All India."}

    if not state or not state.strip():
        return {
            "field": "state",
            "status": "missing",
            "message": "State of residence is required to determine eligibility.",
        }

    user_state = state.strip().lower()
    norm_allowed = [s.strip().lower() for s in allowed_states]

    if user_state in norm_allowed:
        return {
            "field": "state",
            "status": "passed",
            "message": f"State of residence ({state}) matches scheme location requirement.",
        }

    return {
        "field": "state",
        "status": "failed",
        "message": f"State of residence ({state}) is not eligible for this state scheme (Requires: {', '.join(allowed_states)}).",
    }


def evaluate_occupation(occupation: Optional[str], allowed_occupations: List[str]) -> Dict[str, Any]:
    """Evaluate user occupation."""
    if not allowed_occupations:
        return {"field": "occupation", "status": "not_applicable", "message": "No occupation restriction."}

    if not occupation or not occupation.strip():
        return {
            "field": "occupation",
            "status": "missing",
            "message": "Occupation is required to determine eligibility.",
        }

    user_occ = occupation.strip().lower()
    norm_allowed = [o.strip().lower() for o in allowed_occupations]

    if user_occ in norm_allowed:
        return {
            "field": "occupation",
            "status": "passed",
            "message": f"Occupation ({occupation}) matches scheme target occupation.",
        }

    return {
        "field": "occupation",
        "status": "failed",
        "message": f"Occupation ({occupation}) is not eligible for this scheme (Eligible: {', '.join(allowed_occupations)}).",
    }


def evaluate_education(education: Optional[str], allowed_education: List[str]) -> Dict[str, Any]:
    """Evaluate user education level."""
    if not allowed_education:
        return {"field": "education", "status": "not_applicable", "message": "No education restriction."}

    if not education or not education.strip():
        return {
            "field": "education",
            "status": "missing",
            "message": "Education level is required to determine eligibility.",
        }

    user_edu = education.strip().lower()
    norm_allowed = [e.strip().lower() for e in allowed_education]

    if user_edu in norm_allowed:
        return {
            "field": "education",
            "status": "passed",
            "message": f"Education level ({education}) matches scheme requirement.",
        }

    return {
        "field": "education",
        "status": "failed",
        "message": f"Education level ({education}) does not match scheme target education ({', '.join(allowed_education)}).",
    }


def evaluate_gender(gender: Optional[str], allowed_gender: List[str]) -> Dict[str, Any]:
    """Evaluate user gender."""
    if not allowed_gender:
        return {"field": "gender", "status": "not_applicable", "message": "No gender restriction."}

    if not gender or not gender.strip():
        return {
            "field": "gender",
            "status": "missing",
            "message": "Gender is required to determine eligibility.",
        }

    user_gen = gender.strip().lower()
    norm_allowed = [g.strip().lower() for g in allowed_gender]

    if user_gen in norm_allowed:
        return {
            "field": "gender",
            "status": "passed",
            "message": f"Gender ({gender}) satisfies scheme gender requirement.",
        }

    return {
        "field": "gender",
        "status": "failed",
        "message": f"Scheme is restricted to {', '.join(allowed_gender)} applicants.",
    }


def evaluate_category(category: Optional[str], allowed_categories: List[str]) -> Dict[str, Any]:
    """Evaluate social category (SC/ST/OBC/General)."""
    if not allowed_categories:
        return {"field": "category", "status": "not_applicable", "message": "No social category restriction."}

    if not category or not category.strip():
        return {
            "field": "category",
            "status": "missing",
            "message": "Social category is required to determine eligibility.",
        }

    user_cat = category.strip().lower()
    norm_allowed = [c.strip().lower() for c in allowed_categories]

    if user_cat in norm_allowed:
        return {
            "field": "category",
            "status": "passed",
            "message": f"Social category ({category.upper()}) is eligible.",
        }

    return {
        "field": "category",
        "status": "failed",
        "message": f"Category ({category.upper()}) is not eligible (Eligible: {', '.join([c.upper() for c in allowed_categories])}).",
    }


def evaluate_boolean_flag(
    user_flag: Optional[bool], req_flag: Optional[bool], flag_name: str
) -> Dict[str, Any]:
    """Evaluate boolean status flag (is_farmer, is_student, is_disabled)."""
    if req_flag is None:
        return {"field": flag_name, "status": "not_applicable", "message": f"No {flag_name} restriction."}

    if user_flag is None:
        return {
            "field": flag_name,
            "status": "missing",
            "message": f"{flag_name.replace('_', ' ').title()} status is required to determine eligibility.",
        }

    if user_flag == req_flag:
        return {
            "field": flag_name,
            "status": "passed",
            "message": f"{flag_name.replace('_', ' ').title()} requirement satisfied.",
        }

    return {
        "field": flag_name,
        "status": "failed",
        "message": f"User does not satisfy required {flag_name.replace('_', ' ')} status.",
    }
