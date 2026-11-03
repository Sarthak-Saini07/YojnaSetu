from app.config import settings


def test_settings_loaded():
    assert settings.DATABASE_NAME == "government_schemes"
    assert settings.MONGODB_URI is not None
    assert isinstance(settings.BACKEND_PORT, int)
