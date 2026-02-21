"""
FleetFlow — FastAPI Application Entry Point.

Uses the modern `lifespan` context manager instead of deprecated on_event.
Registers all API v1 routers under /api/v1 prefix.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.core.database import engine, Base

# Import all models so Base.metadata knows about every table
import app.models  # noqa: F401

# ── Routers ──
from app.auth.routes import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.api.v1.routes import router as api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup (dev convenience). Use Alembic in prod."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


# ── App factory ──
app = FastAPI(
    title="FleetFlow API",
    version="1.0.0",
    description="Fleet & Logistics Management System",
    lifespan=lifespan,
)

# ── Middleware ──
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routers ──
# Legacy routes (backward compat for existing frontend)
app.include_router(auth_router)
app.include_router(dashboard_router)

# New API v1 routes
app.include_router(api_v1_router)


# ── Health checks ──
@app.get("/")
def root():
    return {"message": "FleetFlow API is running 🚀"}


@app.get("/health")
def health():
    return {"status": "OK"}