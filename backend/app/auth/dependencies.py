"""
Backward-compatible re-export.

Existing code imports from app.auth.dependencies — this module now
delegates to the canonical app.core.dependencies module.
"""

from app.core.dependencies import get_current_user, require_role  # noqa: F401