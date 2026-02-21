"""
API v1 route registry.

All feature routers are aggregated here under the /api/v1 prefix.
main.py mounts this single router.
"""

from fastapi import APIRouter

from app.api.v1.routes import (
    vehicles,
    drivers,
    trips,
    maintenance,
    fuel,
    expenses,
    analytics,
)

router = APIRouter(prefix="/api/v1")

router.include_router(vehicles.router)
router.include_router(drivers.router)
router.include_router(trips.router)
router.include_router(maintenance.router)
router.include_router(fuel.router)
router.include_router(expenses.router)
router.include_router(analytics.router)
