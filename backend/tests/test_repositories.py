import pytest
from scripts.seed_schemes import SEED_SCHEMES
from app.schemas.scheme import SchemeCreate


def test_seed_schemes_dataset_validity():
    """Verify all seed schemes satisfy SchemeCreate schema requirements."""
    assert len(SEED_SCHEMES) >= 15, f"Expected at least 15 seed schemes, got {len(SEED_SCHEMES)}"

    slugs = set()
    for raw_scheme in SEED_SCHEMES:
        # Check uniqueness of slugs
        assert raw_scheme["slug"] not in slugs, f"Duplicate slug found: {raw_scheme['slug']}"
        slugs.add(raw_scheme["slug"])

        # Validate against Pydantic model
        scheme_obj = SchemeCreate(**raw_scheme)
        assert scheme_obj.name
        assert scheme_obj.application.official_url.startswith("http")
        assert scheme_obj.source.source_url.startswith("http")
        assert len(scheme_obj.benefits) > 0
        assert len(scheme_obj.documents) > 0
