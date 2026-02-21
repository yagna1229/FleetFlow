"""Vehicles API — CRUD + status operations. RBAC: manager (full), dispatcher (read)."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut
from app.services.vehicle_service import VehicleService
from app.utils.enums import VehicleStatus
from app.utils.pagination import PaginationParams

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

# ── Read endpoints: manager + dispatcher ──

@router.get("/", response_model=list[VehicleOut])
async def list_vehicles(
    response: Response,
    status_filter: VehicleStatus | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "dispatcher")),
):
    svc = VehicleService(db)
    items, total = await svc.list_vehicles(
        offset=pagination.offset, limit=pagination.limit, status_filter=status_filter
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(pagination.page)
    response.headers["X-Per-Page"] = str(pagination.per_page)
    return items


@router.get("/available", response_model=list[VehicleOut])
async def get_available_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "dispatcher")),
):
    svc = VehicleService(db)
    return await svc.get_available_vehicles()


@router.get("/{vehicle_id}", response_model=VehicleOut)
async def get_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager", "dispatcher")),
):
    svc = VehicleService(db)
    return await svc.get_vehicle(vehicle_id)


# ── Write endpoints: manager only ──

@router.post("/", response_model=VehicleOut, status_code=201)
async def create_vehicle(
    data: VehicleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = VehicleService(db)
    return await svc.create_vehicle(data)


@router.patch("/{vehicle_id}", response_model=VehicleOut)
async def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = VehicleService(db)
    return await svc.update_vehicle(vehicle_id, data)


@router.post("/{vehicle_id}/retire", response_model=VehicleOut)
async def retire_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = VehicleService(db)
    return await svc.retire_vehicle(vehicle_id)
