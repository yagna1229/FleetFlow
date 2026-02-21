"""Trips API — full dispatch lifecycle. RBAC: manager+dispatcher (write), all roles (read)."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.trip import TripCreate, TripDispatch, TripComplete, TripOut, TripDetailOut
from app.services.trip_service import TripService
from app.utils.enums import TripStatus
from app.utils.pagination import PaginationParams

router = APIRouter(prefix="/trips", tags=["Trips"])

# ── Read endpoints: all authenticated roles ──

@router.get("/", response_model=list[TripOut])
async def list_trips(
    response: Response,
    status_filter: TripStatus | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = TripService(db)
    items, total = await svc.list_trips(
        offset=pagination.offset, limit=pagination.limit, status_filter=status_filter
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(pagination.page)
    response.headers["X-Per-Page"] = str(pagination.per_page)
    return items


@router.get("/{trip_id}", response_model=TripDetailOut)
async def get_trip(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = TripService(db)
    return await svc.get_trip(trip_id)


# ── Write endpoints: manager + dispatcher ──

@router.post("/", response_model=TripOut, status_code=201)
async def create_trip(
    data: TripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "dispatcher")),
):
    svc = TripService(db)
    return await svc.create_trip(data, created_by=current_user.id)


@router.post("/{trip_id}/dispatch", response_model=TripOut)
async def dispatch_trip(
    trip_id: int,
    data: TripDispatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "dispatcher")),
):
    svc = TripService(db)
    return await svc.dispatch_trip(trip_id, data.start_odometer)


@router.post("/{trip_id}/complete", response_model=TripOut)
async def complete_trip(
    trip_id: int,
    data: TripComplete,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "dispatcher")),
):
    svc = TripService(db)
    return await svc.complete_trip(trip_id, data.end_odometer)


@router.post("/{trip_id}/cancel", response_model=TripOut)
async def cancel_trip(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "dispatcher")),
):
    svc = TripService(db)
    return await svc.cancel_trip(trip_id)
