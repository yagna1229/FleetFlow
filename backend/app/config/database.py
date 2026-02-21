"""
Backward-compatible re-export.

Existing code imports from app.config.database — this module now
delegates everything to the canonical app.core.database module.
"""

from app.core.database import engine, Base, AsyncSessionLocal, get_db  # noqa: F401