from app.config import settings


def test_settings_loaded():
    assert settings.DATABASE_NAME in ("government_scheme_db", "government_schemes", "govt_scheme_db")
    assert settings.MONGODB_URI is not None
    assert isinstance(settings.BACKEND_PORT, int)
