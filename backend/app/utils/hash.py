"""
Backward-compatible re-export.

Existing code imports from app.utils.hash — this module now
delegates to the canonical app.core.security module.
"""

from app.core.security import hash_password, verify_password  # noqa: F401