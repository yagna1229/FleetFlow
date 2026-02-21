from fastapi import APIRouter,Depends,HTTPException,Response
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate,UserLogin
from app.models.user import User
from app.auth.jwt_handler import create_acess_token
from app.utils.hash import hash_password,verify_password
from app.config.database import get_db
from sqlalchemy import select
from app.auth.oauth import oauth
from fastapi.responses import RedirectResponse



# from app.auth.dependencies import get_db
router = APIRouter(prefix="/auth",tags=["Authentication app routes"])



# 🔹 Step 1: Redirect user to Google login
@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


# 🔹 Step 2: Google callback
@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):

    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    email = user_info["email"]

    # Check if user exists
    
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            username=user_info.get("name"),
            is_google_user=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Create JWT
    access_token = create_acess_token({"user_id": user.id})

    response = RedirectResponse(url="http://localhost:3000/dashboard")

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax"
    )

    return response




@router.post('/signup')
async def signup(user:UserCreate,response:Response,db:AsyncSession = Depends(get_db)):
  

    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400,detail=["Email Already Registered"])
    
    new_user = User(
        email= user.email,
        hashed_password = hash_password(user.password)
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_acess_token({"user_id":new_user.id})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax"
                )
    
    return {"message":"User Created"}

@router.post("/login")
async def login(user:UserLogin,response:Response,db:AsyncSession= Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    db_user = result.scalar_one_or_none()

    if not db_user or not verify_password(user.password,db_user.hashed_password):
        raise HTTPException(status_code=401,detail="Invalid Credentials")
    
    token = create_acess_token({"user_id":db_user.id})

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax"
    )

    return {"message":"Logged in"}

@router.post("/logout")
async def logout(response:Response):
    response.delete_cookie("access_token")
    return {"Message":"Logged Out"}
