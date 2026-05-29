from fastapi import APIRouter, Depends

from app.core.auth import get_current_user_payload
from app.models.auth_models import AuthLoginRequest, RefreshRequest, TokenPair, AuthMeResponse
from app.services.auth_service import login, refresh

router = APIRouter()


@router.post("/login", response_model=TokenPair)
async def login_route(data: AuthLoginRequest):
    return await login(data.identifier, data.password)


@router.post("/refresh", response_model=TokenPair)
async def refresh_route(data: RefreshRequest):
    return await refresh(data.refresh_token)


@router.get("/me", response_model=AuthMeResponse)
async def me_route(payload: dict = Depends(get_current_user_payload)):
    return {"email": payload.get("email"), "role": payload.get("role", "user"), "sub": payload.get("sub")}
