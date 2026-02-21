import asyncio
import os
from sqlalchemy import select
from sqlalchemy.orm import selectinload

async def check():
    from app.core.database import async_sessionmaker
    from app.models.user import User
    
    async with async_sessionmaker() as session:
        result = await session.execute(select(User).options(selectinload(User.role)))
        users = result.scalars().all()
        for u in users:
            print(f"User: {u.email}, Role ID: {u.role_id}, Role Name: {u.role.name if u.role else 'NONE'}")

if __name__ == "__main__":
    asyncio.run(check())
