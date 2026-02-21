"""
Centralised application settings.

Reads from .env via pydantic-settings.  Every module should import `settings`
from here instead of calling os.getenv() directly.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ──
    DATABASE_URL: str

    # ── JWT / Auth ──
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Google OAuth ──
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # ── CORS ──
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Email / SMTP (for password-reset, verification) ──
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",          # ignore env vars we don't declare
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton so the .env file is read only once."""
    return Settings()


settings = get_settings()
