from fastapi import Depends,HTTPException,Request
from app.config.database import get_db
from app.auth.jwt_handler import verify_token
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User

async def get_current_user(request:Request,db:AsyncSession = Depends(get_db)):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401,detail="Not Authenticated")
    
    payload = verify_token(token)
    result = await db.execute(select(User).where(User.id == payload["user_id"]))
    user = result.scalar_one_or_none()
    
    if not user:
       raise HTTPException(status_code=401,detail="User not Found")
    
    return user