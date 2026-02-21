from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession,create_async_engine


DATABASE_URL = "postgresql+asyncpg://postgres:yagna@localhost:5432/odoo"

engine = create_async_engine(DATABASE_URL,echo=True)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as db:
        yield db

Base = declarative_base()