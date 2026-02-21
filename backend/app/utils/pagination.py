"""
Pagination helper for offset-based API responses.
"""

from fastapi import Query


class PaginationParams:
    """Inject via Depends(PaginationParams) in route signatures."""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number (1-indexed)"),
        per_page: int = Query(25, ge=1, le=100, description="Items per page"),
    ):
        self.page = page
        self.per_page = per_page

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page

    @property
    def limit(self) -> int:
        return self.per_page
