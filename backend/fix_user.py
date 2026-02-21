import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def fix_user():
    async with AsyncSessionLocal() as session:
        # 1. Insert 'manager' role if strictly missing
        await session.execute(
            text("INSERT INTO roles (name, description) VALUES ('manager', 'Full system access') ON CONFLICT (name) DO NOTHING")
        )
        await session.commit()
        
        # 2. Get manager role ID
        res = await session.execute(text("SELECT id FROM roles WHERE name = 'manager'"))
        manager_id = res.scalar_one_or_none()
        
        print(f"Manager Role ID: {manager_id}")
        
        # 3. Determine the user
        email = "vraj24092005@gmail.com"
        
        # 4. Update user
        await session.execute(
            text("UPDATE users SET role_id = :role_id WHERE email = :email"),
            {"role_id": manager_id, "email": email}
        )
        await session.commit()
        print(f"Successfully created/found manager role and bound it to user {email}.")

if __name__ == "__main__":
    asyncio.run(fix_user())
