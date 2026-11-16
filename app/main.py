
from fastapi import FastAPI, HTTPException
from sqlalchemy import text

from app.db.session import engine

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.applications import router as applications_router
from app.api.routes.api_keys import router as api_keys_router
from app.api.routes.logs import router as logs_router
from app.api.routes.logs_query import router as logs_query_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="LogLens API",
    description="Centralised Application Monitoring and Incident Management Platform",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True
    }
)


# API Routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(applications_router, prefix="/api/v1")
app.include_router(api_keys_router, prefix="/api/v1")
app.include_router(logs_router, prefix="/api/v1")
app.include_router(logs_query_router, prefix="/api/v1")
app.include_router(incidents_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Welcome to LogLens API",
        "status": "Running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "LogLens"
    }


@app.get("/db-health")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "connected",
            "database": "loglens_db",
            "message": "PostgreSQL connection successful"
        }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )
