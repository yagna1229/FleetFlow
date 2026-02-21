"""Drivers API — CRUD + compliance. RBAC: manager+safety_officer (write), +dispatcher (read)."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.schemas.driver import DriverCreate, DriverUpdate, DriverOut
from app.services.driver_service import DriverService
from app.utils.enums import DriverStatus
from app.utils.pagination import PaginationParams

router = APIRouter(prefix="/drivers", tags=["Drivers"])

# ── Read endpoints: manager + safety_officer + dispatcher ──

@router.get("/", response_model=list[DriverOut])
async def list_drivers(
    response: Response,
    status_filter: DriverStatus | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer", "dispatcher")),
):
    svc = DriverService(db)
    items, total = await svc.list_drivers(
        offset=pagination.offset, limit=pagination.limit, status_filter=status_filter
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(pagination.page)
    response.headers["X-Per-Page"] = str(pagination.per_page)
    return items


@router.get("/available", response_model=list[DriverOut])
async def get_available_drivers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer", "dispatcher")),
):
    svc = DriverService(db)
    return await svc.get_available_drivers()


@router.get("/expiring-licenses", response_model=list[DriverOut])
async def get_expiring_licenses(
    within_days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer")),
):
    svc = DriverService(db)
    return await svc.get_expiring_licenses(within_days)


@router.get("/{driver_id}", response_model=DriverOut)
async def get_driver(
    driver_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer", "dispatcher")),
):
    svc = DriverService(db)
    return await svc.get_driver(driver_id)


# ── Write endpoints: manager + safety_officer ──

@router.post("/", response_model=DriverOut, status_code=201)
async def create_driver(
    data: DriverCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer")),
):
    svc = DriverService(db)
    return await svc.create_driver(data)


@router.patch("/{driver_id}", response_model=DriverOut)
async def update_driver(
    driver_id: int,
    data: DriverUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer")),
):
    svc = DriverService(db)
    return await svc.update_driver(driver_id, data)
