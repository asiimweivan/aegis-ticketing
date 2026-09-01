from fastapi import APIRouter
from app.api.v1.endpoints import auth, tickets, users, analytics, notifications

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(tickets.router)
api_router.include_router(users.router)
api_router.include_router(analytics.router)
api_router.include_router(notifications.router)