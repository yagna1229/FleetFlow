from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.config.database import engine, Base
from app.auth.routes import router as auth_router
from app.routes.dashboard import router as dashboard_router

# 🔹 Initialize FastAPI app
app = FastAPI(
    title="Odoo Hackathon API",
    version="1.0.0"
)

# 🔹 Session middleware (Required for Google OAuth)
app.add_middleware(
    SessionMiddleware,
    secret_key="super-secret-session-key"
)

# 🔹 CORS middleware (Important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Include routers
app.include_router(auth_router)
app.include_router(dashboard_router)

# 🔹 Startup event to create tables
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# 🔹 Root route
@app.get("/")
def root():
    return {"message": "API is running 🚀"}

# 🔹 Health check
@app.get("/health")
def health():
    return {"status": "OK"}