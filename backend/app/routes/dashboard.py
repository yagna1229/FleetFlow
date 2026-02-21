from fastapi import APIRouter,Depends
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/dashboard",tags=["Dashboard"])

@router.get("/")
def get_dashboard(current_user=Depends(get_current_user)):
    return{
        "message":f"Welcome{current_user.email}"
    }