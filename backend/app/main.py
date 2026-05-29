import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app import models
from app.routers import (
    auth_router,
    dashboard_router,
    inventories_router,
    items_router,
)

app = FastAPI(title="InvenTrack API")

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
# allow_origins=["*"] + allow_credentials=True is an invalid combination per
# the CORS spec and is rejected by all modern browsers.  Instead we read an
# explicit comma-separated list of allowed origins from the environment.
# In Render, set:  CORS_ORIGINS=https://your-app.vercel.app
# Locally it falls back to localhost so dev still works.
# ---------------------------------------------------------------------------
_raw_origins = os.environ.get(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,https://ai-traning-docker-irowv5kig-giriakki742-9448s-projects.vercel.app"
)
ALLOWED_ORIGINS: list[str] = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=engine)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "InvenTrack API"}


@app.get("/api/health")
def health():
    """Render health-check endpoint."""
    return {"status": "ok"}


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(inventories_router)
app.include_router(items_router)
