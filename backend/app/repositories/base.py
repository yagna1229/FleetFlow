"""
Generic CRUD repository base class.

Provides create, get_by_id, list_all, update, and delete operations.
Feature-specific repositories extend this with domain queries.
"""

from typing import TypeVar, Generic, Type, Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    """Generic async CRUD repository."""

    def __init__(self, model: Type[T], db: AsyncSession):
        self.model = model
        self.db = db

    async def create(self, **kwargs) -> T:
        instance = self.model(**kwargs)
        self.db.add(instance)
        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def get_by_id(self, id: int) -> T | None:
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def list_all(
        self,
        offset: int = 0,
        limit: int = 25,
        filters: list | None = None,
    ) -> tuple[Sequence[T], int]:
        """Returns (items, total_count) tuple."""
        stmt = select(self.model)
        count_stmt = select(func.count()).select_from(self.model)

        if filters:
            for f in filters:
                stmt = stmt.where(f)
                count_stmt = count_stmt.where(f)

        # Total count
        total = (await self.db.execute(count_stmt)).scalar() or 0

        # Paginated results
        stmt = stmt.offset(offset).limit(limit).order_by(self.model.id.desc())
        result = await self.db.execute(stmt)
        items = result.scalars().all()

        return items, total

    async def update(self, instance: T, **kwargs) -> T:
        for key, value in kwargs.items():
            if value is not None:
                setattr(instance, key, value)
        await self.db.commit()
        await self.db.refresh(instance)
        return instance

    async def delete(self, instance: T) -> None:
        await self.db.delete(instance)
        await self.db.commit()
