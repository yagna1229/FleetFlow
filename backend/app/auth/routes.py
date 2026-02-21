"""
Auth routes — login, signup, Google OAuth, and /auth/me.

JWT now embeds { user_id, role } so the frontend can render role-based UI.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.schemas.user import UserCreate, UserLogin
from app.models.user import User
from app.models.role import Role
from app.auth.jwt_handler import create_acess_token
from app.utils.hash import hash_password, verify_password
from app.config.database import get_db
from app.auth.oauth import oauth
from app.core.dependencies import get_current_user
from fastapi.responses import RedirectResponse


VALID_ROLES = {"manager", "dispatcher", "safety_officer", "financial_analyst"}

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Helper ──
async def _resolve_role_id(db: AsyncSession, role_name: str) -> int | None:
    """Look up roles table and return the id, or None."""
    result = await db.execute(select(Role).where(Role.name == role_name))
    role = result.scalar_one_or_none()
    return role.id if role else None


def _make_token(user: User, role_name: str | None) -> str:
    """Create JWT with user_id + role."""
    return create_acess_token({"user_id": user.id, "role": role_name or "manager"})


# ── GET /auth/me — returns current user + role ──
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    role_name = current_user.role.name if current_user.role else "manager"
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": role_name,
    }


# ── POST /auth/signup ──
@router.post("/signup")
async def signup(user: UserCreate, response: Response, db: AsyncSession = Depends(get_db)):
    # Validate role
    role_name = user.role if user.role in VALID_ROLES else "manager"

    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email Already Registered")

    role_id = await _resolve_role_id(db, role_name)

    import random
    from datetime import datetime, timedelta, timezone
    from app.utils.email import send_otp_email
    
    otp = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    new_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        role_id=role_id,
        is_verified=False,
        otp_code=otp,
        otp_expires_at=expires_at
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    send_otp_email(to_email=user.email, otp=otp, subject="Welcome to FleetFlow - Your Verification Code")

    # We do NOT set the cookie for an unverified user. They must verify first.
    return {
        "message": "User Created. Please verify your email.",
        "role": role_name,
        "is_verified": False
    }

# ── POST /auth/login ──
@router.post("/login")
async def login(user: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    db_user = result.scalar_one_or_none()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")

    if not db_user.is_verified:
        return {"message": "Email not verified", "is_verified": False}

    # Load role
    role_name = "manager"
    if db_user.role_id:
        role_result = await db.execute(select(Role).where(Role.id == db_user.role_id))
        role_obj = role_result.scalar_one_or_none()
        if role_obj:
            role_name = role_obj.name

    token = _make_token(db_user, role_name)

    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax")
    return {"message": "Logged in", "role": role_name, "is_verified": True}


# ── Google OAuth ──
@router.get("/google/login")
async def google_login(request: Request, role: str = "manager"):
    """Step 1: redirect to Google. Role is passed as query param and stored in session."""
    if role not in VALID_ROLES:
        role = "manager"
    request.session["pending_role"] = role
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """Step 2: Google redirects here. Create/find user, assign role, set JWT."""
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")
    email = user_info["email"]

    # Get role from session
    role_name = request.session.pop("pending_role", "manager")
    if role_name not in VALID_ROLES:
        role_name = "manager"

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        role_id = await _resolve_role_id(db, role_name)
        user = User(
            email=email,
            username=user_info.get("name"),
            is_google_user=True,
            role_id=role_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update role if user already exists (optional: only if no role set)
        if not user.role_id:
            role_id = await _resolve_role_id(db, role_name)
            user.role_id = role_id
            await db.commit()
            await db.refresh(user)
        else:
            # Use existing role
            role_result = await db.execute(select(Role).where(Role.id == user.role_id))
            role_obj = role_result.scalar_one_or_none()
            if role_obj:
                role_name = role_obj.name

    access_token = _make_token(user, role_name)

    response = RedirectResponse(url="http://localhost:3000/dashboard")
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    return response


# ── POST /auth/logout ──
@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged Out"}


# ── POST /auth/verify-email ──
from app.schemas.user import EmailVerification, ForgotPassword, ResetPassword

@router.post("/verify-email")
async def verify_email(data: EmailVerification, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    from datetime import datetime, timezone
    
    if user.is_verified:
        return {"message": "Already verified"}
        
    if not user.otp_code or user.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    if not user.otp_expires_at or user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP Expired")
        
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    await db.commit()
    
    # Optional: Log them in automatically upon verification
    role_name = "manager"
    if user.role_id:
        role_result = await db.execute(select(Role).where(Role.id == user.role_id))
        role_obj = role_result.scalar_one_or_none()
        if role_obj:
            role_name = role_obj.name
            
    token = _make_token(user, role_name)
    response.set_cookie(key="access_token", value=token, httponly=True, samesite="lax")
    
    return {"message": "Email verified successfully", "role": role_name}


# ── POST /auth/resend-otp ──
@router.post("/resend-otp")
async def resend_otp(data: ForgotPassword, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user:
        # Don't reveal user existence
        return {"message": "OTP sent if email exists"}
        
    if user.is_verified:
        return {"message": "User already verified"}
        
    import random
    from datetime import datetime, timedelta, timezone
    from app.utils.email import send_otp_email
    
    otp = str(random.randint(100000, 999999))
    user.otp_code = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    await db.commit()
    
    send_otp_email(to_email=user.email, otp=otp, subject="Your New Verification Code")
    return {"message": "OTP resent"}


# ── POST /auth/forgot-password ──
@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user:
        return {"message": "OTP sent if email exists"}
        
    import random
    from datetime import datetime, timedelta, timezone
    from app.utils.email import send_otp_email
    
    otp = str(random.randint(100000, 999999))
    user.otp_code = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    await db.commit()
    
    send_otp_email(to_email=user.email, otp=otp, subject="Password Reset Code")
    return {"message": "OTP sent if email exists"}


# ── POST /auth/reset-password ──
@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    from datetime import datetime, timezone
    
    if not user.otp_code or user.otp_code != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    if not user.otp_expires_at or user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP Expired")
        
    user.hashed_password = hash_password(data.new_password)
    user.otp_code = None
    user.otp_expires_at = None
    await db.commit()
    
    return {"message": "Password reset successful"}
