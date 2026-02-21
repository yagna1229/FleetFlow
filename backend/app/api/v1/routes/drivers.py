"""Drivers API — CRUD + compliance. RBAC: manager (write), safety_officer (update), others (read)."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User
from app.schemas.driver import DriverCreate, DriverUpdate, DriverOut
from app.services.driver_service import DriverService
from app.utils.enums import DriverStatus
from app.utils.pagination import PaginationParams
from app.utils.rbac import filter_response

router = APIRouter(prefix="/drivers", tags=["Drivers"])

DRIVER_EXCLUDES = {
    # e.g. "dispatcher": {"phone"} if we wanted to hide it, but we can leave empty for now
}

ALL_ROLES = ["manager", "dispatcher", "safety_officer", "financial_analyst"]


# ── Read endpoints: all roles ──

@router.get("/", response_model=list[DriverOut], response_model_exclude_none=True)
async def list_drivers(
    response: Response,
    status_filter: DriverStatus | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(*ALL_ROLES)),
):
    svc = DriverService(db)
    items, total = await svc.list_drivers(
        offset=pagination.offset, limit=pagination.limit, status_filter=status_filter
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(pagination.page)
    response.headers["X-Per-Page"] = str(pagination.per_page)
    
    out_items = [DriverOut.model_validate(x) for x in items]
    return filter_response(out_items, current_user, DRIVER_EXCLUDES)


@router.get("/available", response_model=list[DriverOut], response_model_exclude_none=True)
async def get_available_drivers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(*ALL_ROLES)),
):
    svc = DriverService(db)
    items = await svc.get_available_drivers()
    out_items = [DriverOut.model_validate(x) for x in items]
    return filter_response(out_items, current_user, DRIVER_EXCLUDES)


@router.get("/expiring-licenses", response_model=list[DriverOut], response_model_exclude_none=True)
async def get_expiring_licenses(
    within_days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer")),
):
    svc = DriverService(db)
    items = await svc.get_expiring_licenses(within_days)
    out_items = [DriverOut.model_validate(x) for x in items]
    return filter_response(out_items, current_user, DRIVER_EXCLUDES)


@router.get("/{driver_id}", response_model=DriverOut, response_model_exclude_none=True)
async def get_driver(
    driver_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(*ALL_ROLES)),
):
    svc = DriverService(db)
    item = await svc.get_driver(driver_id)
    out_item = DriverOut.model_validate(item)
    return filter_response(out_item, current_user, DRIVER_EXCLUDES)


# ── Write endpoints: manager + safety_officer ──

@router.post("/", response_model=DriverOut, status_code=201, response_model_exclude_none=True)
async def create_driver(
    data: DriverCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = DriverService(db)
    item = await svc.create_driver(data)
    out_item = DriverOut.model_validate(item)
    return filter_response(out_item, current_user, DRIVER_EXCLUDES)


@router.patch("/{driver_id}", response_model=DriverOut, response_model_exclude_none=True)
async def update_driver(
    driver_id: int,
    data: DriverUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "safety_officer")),
):
    svc = DriverService(db)
    item = await svc.update_driver(driver_id, data)
    out_item = DriverOut.model_validate(item)
    return filter_response(out_item, current_user, DRIVER_EXCLUDES)
