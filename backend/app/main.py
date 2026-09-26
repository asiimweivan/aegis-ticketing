from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.core.limiter import limiter
from app.api.v1.router import api_router
from app.db.init_db import init_db, seed_admin
from app.services.escalation_service import run_sla_escalation_check

scheduler = BackgroundScheduler()


def _scheduled_escalation_check():
    try:
        result = run_sla_escalation_check()
        if result["escalated_count"] > 0:
            print("SLA escalation: " + str(result["escalated_count"]) + " ticket(s) escalated - " + ", ".join(result["tickets"]))
    except Exception as e:
        print("WARNING: scheduled SLA escalation check failed: " + str(e))


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    init_db()
    seed_admin()
    scheduler.add_job(_scheduled_escalation_check, "interval", minutes=5, id="sla_escalation_check")
    scheduler.start()
    print("SLA escalation scheduler started (checks every 5 minutes)")
    yield
    scheduler.shutdown()
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## AEGIS AI-Based Ticketing System API

Intelligent issue management platform for **Adaptive Engineering Group (A.E.G) Ltd**.

### Features
- AI-powered ticket classification & prioritization
- Three user roles: Client, Staff, Admin
- Real-time analytics dashboard
- Automated notifications
- ML-based recurring issue detection
- Automatic SLA breach escalation
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
