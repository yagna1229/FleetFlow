import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check():
    async with engine.begin() as conn:
        r = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'users' ORDER BY ordinal_position"
        ))
        cols = [row[0] for row in r.all()]
        print("Users table columns:", cols)

        r2 = await conn.execute(text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'public' ORDER BY table_name"
        ))
        tables = [row[0] for row in r2.all()]
        print("All tables:", tables)

asyncio.run(check())
