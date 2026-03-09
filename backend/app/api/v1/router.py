from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, obras, boletins, cronogramas

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(obras.router)
api_router.include_router(boletins.router)
api_router.include_router(cronogramas.router)
