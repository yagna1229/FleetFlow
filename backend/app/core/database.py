"""
Async SQLAlchemy engine, session factory, and declarative Base.

This replaces app/config/database.py as the canonical import location.
The old module is kept for backward-compat and re-exports from here.
"""

from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,          # set True only for debugging
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # detect stale connections
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    """FastAPI dependency – yields a scoped async session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
