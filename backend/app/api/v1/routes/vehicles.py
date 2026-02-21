"""Vehicles API — CRUD + status operations. RBAC: manager (full), others (read)."""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut
from app.services.vehicle_service import VehicleService
from app.utils.enums import VehicleStatus
from app.utils.pagination import PaginationParams
from app.utils.rbac import filter_response

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

VEHICLE_EXCLUDES = {
    "dispatcher": {"acquisition_cost"},
    "safety_officer": {"acquisition_cost"},
}

ALL_ROLES = ["manager", "dispatcher", "safety_officer", "financial_analyst"]


# ── Read endpoints: all roles ──

@router.get("/", response_model=list[VehicleOut], response_model_exclude_none=True)
async def list_vehicles(
    response: Response,
    status_filter: VehicleStatus | None = None,
    pagination: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(*ALL_ROLES)),
):
    svc = VehicleService(db)
    items, total = await svc.list_vehicles(
        offset=pagination.offset, limit=pagination.limit, status_filter=status_filter
    )
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(pagination.page)
    response.headers["X-Per-Page"] = str(pagination.per_page)
    
    out_items = [VehicleOut.model_validate(item) for item in items]
    return filter_response(out_items, current_user, VEHICLE_EXCLUDES)


@router.get("/available", response_model=list[VehicleOut], response_model_exclude_none=True)
async def get_available_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(*ALL_ROLES)),
):
    svc = VehicleService(db)
    items = await svc.get_available_vehicles()
    out_items = [VehicleOut.model_validate(item) for item in items]
    return filter_response(out_items, current_user, VEHICLE_EXCLUDES)


@router.get("/{vehicle_id}", response_model=VehicleOut, response_model_exclude_none=True)
async def get_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(*ALL_ROLES)),
):
    svc = VehicleService(db)
    item = await svc.get_vehicle(vehicle_id)
    out_item = VehicleOut.model_validate(item)
    return filter_response(out_item, current_user, VEHICLE_EXCLUDES)


# ── Write endpoints: manager only ──

@router.post("/", response_model=VehicleOut, status_code=201, response_model_exclude_none=True)
async def create_vehicle(
    data: VehicleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = VehicleService(db)
    item = await svc.create_vehicle(data)
    out_item = VehicleOut.model_validate(item)
    return filter_response(out_item, current_user, VEHICLE_EXCLUDES)


@router.patch("/{vehicle_id}", response_model=VehicleOut, response_model_exclude_none=True)
async def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = VehicleService(db)
    item = await svc.update_vehicle(vehicle_id, data)
    out_item = VehicleOut.model_validate(item)
    return filter_response(out_item, current_user, VEHICLE_EXCLUDES)


@router.post("/{vehicle_id}/retire", response_model=VehicleOut, response_model_exclude_none=True)
async def retire_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("manager")),
):
    svc = VehicleService(db)
    item = await svc.retire_vehicle(vehicle_id)
    out_item = VehicleOut.model_validate(item)
    return filter_response(out_item, current_user, VEHICLE_EXCLUDES)

