"""
Backward-compatible re-export.

Existing code imports from app.auth.jwt_handler — this module now
delegates to the canonical app.core.security module.
"""

from app.core.security import (  # noqa: F401
    create_access_token as create_acess_token,   # preserve the original typo for compat
    create_access_token,
    verify_token,
)
