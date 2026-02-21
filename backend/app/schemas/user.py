from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "manager"  # manager | dispatcher | safety_officer | financial_analyst


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: Optional[str] = None

    class Config:
        from_attributes = True